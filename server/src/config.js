import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const config = {
  port: parseInt(process.env.PORT || '3014', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: (process.env.APP_URL || 'https://drive.sekaitech.com.pe').replace(/\/+$/, ''),
  jwtSecret: process.env.JWT_SECRET || 'sekaitech_super_secret_drive_key_2026',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5446/drive_billonmail',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '2048', 10),
  defaultRetentionDays: parseInt(process.env.DEFAULT_RETENTION_DAYS || '15', 10),
  paths: {
    root: rootDir,
    uploadsFiles: path.join(rootDir, 'uploads', 'files'),
    uploadsSignatures: path.join(rootDir, 'uploads', 'signatures'),
    public: path.join(rootDir, 'public')
  }
};
