import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config.js';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.paths.uploadsSignatures);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-');
    const uniqueSuffix = crypto.randomBytes(4).toString('hex');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/gif', 'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no soportado. Solo se permiten imágenes (GIF, PNG, JPG, WebP).'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB máximo para un GIF o imagen de firma
});

// Helper para generar los 6 formatos de enlaces estilo Postimages
function generateLinkFormats(filename, originalName, id) {
  const directUrl = `${config.appUrl}/uploads/firmas/${filename}`;
  const viewUrl = `${config.appUrl}/i/${id}`;
  const cleanName = path.basename(originalName, path.extname(originalName));

  return {
    directUrl,
    viewUrl,
    htmlCode: `<img src='${directUrl}' border='0' alt='${cleanName}'>`,
    htmlWithLink: `<a href='https://empresa.com' target='_blank'><img src='${directUrl}' border='0' alt='${cleanName}'></a>`,
    markdown: `![${cleanName}](${directUrl})`,
    bbcode: `[img]${directUrl}[/img]`
  };
}

// POST /api/signatures/upload
router.post('/upload', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen o GIF.' });
    }

    const id = crypto.randomBytes(4).toString('hex');
    const signature = await db.saveSignature({
      id,
      filename: req.file.filename,
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size
    });

    const links = generateLinkFormats(signature.filename, signature.original_name, signature.id);

    return res.status(201).json({
      success: true,
      signature: {
        id: signature.id,
        filename: signature.filename,
        originalName: signature.original_name,
        sizeBytes: signature.size_bytes,
        mimeType: signature.mime_type,
        ...links
      }
    });
  } catch (err) {
    console.error('Error al subir firma/GIF:', err);
    return res.status(500).json({ error: err.message || 'Error al procesar la imagen.' });
  }
});

// GET /api/signatures/recent - Obtener las últimas firmas alojadas
router.get('/recent', requireAuth, async (req, res) => {
  try {
    const list = await db.getRecentSignatures(8);
    const enriched = list.map(item => ({
      id: item.id,
      filename: item.filename,
      originalName: item.original_name,
      mimeType: item.mime_type,
      sizeBytes: item.size_bytes,
      createdAt: item.created_at,
      ...generateLinkFormats(item.filename, item.original_name, item.id)
    }));
    return res.json({ success: true, signatures: enriched });
  } catch (err) {
    console.error('Error al listar firmas recientes:', err);
    return res.status(500).json({ error: 'Error al consultar firmas.' });
  }
});

export default router;
