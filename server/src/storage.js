import fs from 'fs';
import path from 'path';
import { config } from './config.js';

// Asegurar que las carpetas de almacenamiento existan al arrancar
export function initStorage() {
  if (!fs.existsSync(config.paths.uploadsFiles)) {
    fs.mkdirSync(config.paths.uploadsFiles, { recursive: true });
  }
  if (!fs.existsSync(config.paths.uploadsSignatures)) {
    fs.mkdirSync(config.paths.uploadsSignatures, { recursive: true });
  }
}

export function deleteFileSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (err) {
    console.error(`Error al eliminar archivo físico ${filePath}:`, err.message);
  }
  return false;
}
