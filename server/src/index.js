import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';
import { initDb, db } from './db.js';
import { initStorage } from './storage.js';
import { startCleanupCron } from './cron.js';
import filesRouter from './routes/files.js';
import signaturesRouter from './routes/signatures.js';
import authRouter from './routes/auth.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir directamente las firmas/GIFs corporativos con cabeceras completas de CORS, CORP y caché para clientes de correo
app.use('/uploads/firmas', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
}, express.static(config.paths.uploadsSignatures, {
  maxAge: '30d',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  }
}));

// Acceso directo corto para firmas e imágenes corporativas: /s/:id
app.get('/s/:id', async (req, res) => {
  try {
    const sig = await db.getSignature(req.params.id);
    if (!sig) return res.status(404).send('Firma o imagen no encontrada');
    const filePath = path.join(config.paths.uploadsSignatures, sig.filename);
    if (!fs.existsSync(filePath)) return res.status(404).send('Archivo físico no encontrado');

    res.setHeader('Content-Type', sig.mime_type || 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(sig.original_name)}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).send('Error al servir la imagen');
  }
});

// Rutas de API
app.use('/api/auth', authRouter);
app.use('/api/files', filesRouter);
app.use('/api/signatures', signaturesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date(), appUrl: config.appUrl });
});

// Servir frontend en producción si existe la carpeta public/ compilada
if (fs.existsSync(config.paths.public)) {
  app.use(express.static(config.paths.public));

  // SPA fallback para rutas como /v/:id o /firmas
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    res.sendFile(path.join(config.paths.public, 'index.html'));
  });
}

// Inicialización de servicios y arranque
async function bootstrap() {
  initStorage();
  await initDb();
  startCleanupCron();

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 Servidor Drive BillonMail corriendo en:`);
    console.log(`   Local:   http://localhost:${config.port}`);
    console.log(`   Público: ${config.appUrl}`);
    console.log(`   Entorno: ${config.nodeEnv}`);
    console.log(`====================================================`);
  });
}

bootstrap().catch(err => {
  console.error('Fallo al inicializar servidor:', err);
  process.exit(1);
});
