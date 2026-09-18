import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';
import { initDb } from './db.js';
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

// Servir directamente las firmas/GIFs corporativos con cabeceras de caché óptimas para clientes de correo
app.use('/uploads/firmas', express.static(config.paths.uploadsSignatures, {
  maxAge: '30d',
  immutable: true
}));

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
