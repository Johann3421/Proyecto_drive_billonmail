import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { config } from '../config.js';
import { db } from '../db.js';

const router = Router();

// Configuración de Multer para streaming en disco (evita desbordamiento de RAM con videos >10MB)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.paths.uploadsFiles);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 }
});

// POST /api/files/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha adjuntado ningún archivo.' });
    }

    const retentionDays = parseInt(req.body.retentionDays || config.defaultRetentionDays, 10);
    const id = crypto.randomBytes(5).toString('hex'); // 10 caracteres alfanuméricos limpios
    const expiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);

    const transfer = await db.saveTransfer({
      id,
      original_name: req.file.originalname,
      stored_name: req.file.filename,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      expires_at: expiresAt
    });

    const shareUrl = `${config.appUrl}/v/${id}`;
    const directDownloadUrl = `${config.appUrl}/api/files/${id}/download`;

    return res.status(201).json({
      success: true,
      file: {
        id: transfer.id,
        originalName: transfer.original_name,
        sizeBytes: transfer.size_bytes,
        mimeType: transfer.mime_type,
        expiresAt: transfer.expires_at,
        shareUrl,
        directDownloadUrl
      }
    });
  } catch (err) {
    console.error('Error al subir archivo:', err);
    return res.status(500).json({ error: 'Error al procesar la subida del archivo.' });
  }
});

// GET /api/files/:id/meta - Información para la vista del destinatario
router.get('/:id/meta', async (req, res) => {
  try {
    const transfer = await db.getTransfer(req.params.id);
    if (!transfer) {
      return res.status(404).json({ error: 'El archivo no existe o ha expirado.' });
    }

    const isExpired = new Date(transfer.expires_at) < new Date();
    if (isExpired) {
      return res.status(410).json({ error: 'Este enlace ha caducado por límite de tiempo (retención cumplida).' });
    }

    const isVideo = transfer.mime_type && transfer.mime_type.startsWith('video/');

    return res.json({
      id: transfer.id,
      originalName: transfer.original_name,
      sizeBytes: transfer.size_bytes,
      mimeType: transfer.mime_type,
      expiresAt: transfer.expires_at,
      downloadsCount: transfer.downloads_count,
      isVideo,
      streamUrl: `${config.appUrl}/api/files/${transfer.id}/download?stream=true`,
      downloadUrl: `${config.appUrl}/api/files/${transfer.id}/download`
    });
  } catch (err) {
    console.error('Error al obtener metadatos de archivo:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// GET /api/files/:id/download - Soporta Range Requests (streaming de video fluido) y descarga directa
router.get('/:id/download', async (req, res) => {
  try {
    const transfer = await db.getTransfer(req.params.id);
    if (!transfer) {
      return res.status(404).send('Archivo no encontrado.');
    }

    if (new Date(transfer.expires_at) < new Date()) {
      return res.status(410).send('Este archivo ha expirado y ya no está disponible.');
    }

    const filePath = path.join(config.paths.uploadsFiles, transfer.stored_name);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('El archivo físico no existe en el servidor.');
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Incrementar contador solo si no es un byte-range parcial (para no contar cada buffer de video como descarga)
    if (!range && req.query.stream !== 'true') {
      db.incrementDownloads(transfer.id).catch(console.error);
    }

    // Soporte para HTTP Range Request (Video player seeking nativo)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': transfer.mime_type || 'application/octet-stream',
      };
      res.writeHead(206, head);
      file.pipe(res);
      return;
    }

    // Si es para reproducir directamente en el navegador (stream)
    if (req.query.stream === 'true') {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': transfer.mime_type || 'application/octet-stream',
        'Accept-Ranges': 'bytes'
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // Descarga directa obligatoria
    res.download(filePath, transfer.original_name);
  } catch (err) {
    console.error('Error al descargar archivo:', err);
    res.status(500).send('Error al procesar la descarga.');
  }
});

export default router;
