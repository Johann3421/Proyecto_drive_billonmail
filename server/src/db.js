import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

let pool = null;
let isPgConnected = false;

// Almacén en memoria de respaldo para desarrollo local si PostgreSQL aún no está encendido
const localMemoryStore = {
  transfers: new Map(),
  signatures: new Map()
};

export async function initDb() {
  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000
    });

    const client = await pool.connect();
    
    // Crear tablas requeridas si no existen
    await client.query(`
      CREATE TABLE IF NOT EXISTS transfers (
        id VARCHAR(64) PRIMARY KEY,
        original_name TEXT NOT NULL,
        stored_name TEXT NOT NULL,
        mime_type VARCHAR(120),
        size_bytes BIGINT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        downloads_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_transfers_expires_at ON transfers (expires_at);

      CREATE TABLE IF NOT EXISTS signatures (
        id VARCHAR(64) PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type VARCHAR(120),
        size_bytes BIGINT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    client.release();
    isPgConnected = true;
    console.log('✓ Conexión exitosa a PostgreSQL y tablas verificadas.');
  } catch (err) {
    isPgConnected = false;
    console.warn('⚠️  PostgreSQL no disponible o no accesible aún. Activando modo almacenamiento local resiliente.');
    console.warn(`    Detalle: ${err.message}`);
  }
}

export const db = {
  async saveTransfer({ id, original_name, stored_name, mime_type, size_bytes, expires_at }) {
    if (isPgConnected && pool) {
      const res = await pool.query(
        `INSERT INTO transfers (id, original_name, stored_name, mime_type, size_bytes, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [id, original_name, stored_name, mime_type, size_bytes, expires_at]
      );
      return res.rows[0];
    }
    const item = { id, original_name, stored_name, mime_type, size_bytes, expires_at, downloads_count: 0, created_at: new Date() };
    localMemoryStore.transfers.set(id, item);
    return item;
  },

  async getTransfer(id) {
    if (isPgConnected && pool) {
      const res = await pool.query('SELECT * FROM transfers WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    return localMemoryStore.transfers.get(id) || null;
  },

  async incrementDownloads(id) {
    if (isPgConnected && pool) {
      await pool.query('UPDATE transfers SET downloads_count = downloads_count + 1 WHERE id = $1', [id]);
      return;
    }
    const item = localMemoryStore.transfers.get(id);
    if (item) item.downloads_count++;
  },

  async getExpiredTransfers() {
    if (isPgConnected && pool) {
      const res = await pool.query('SELECT * FROM transfers WHERE expires_at < NOW()');
      return res.rows;
    }
    const now = new Date();
    const expired = [];
    for (const item of localMemoryStore.transfers.values()) {
      if (new Date(item.expires_at) < now) expired.push(item);
    }
    return expired;
  },

  async deleteTransfer(id) {
    if (isPgConnected && pool) {
      await pool.query('DELETE FROM transfers WHERE id = $1', [id]);
      return;
    }
    localMemoryStore.transfers.delete(id);
  },

  async saveSignature({ id, filename, original_name, mime_type, size_bytes }) {
    if (isPgConnected && pool) {
      const res = await pool.query(
        `INSERT INTO signatures (id, filename, original_name, mime_type, size_bytes)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [id, filename, original_name, mime_type, size_bytes]
      );
      return res.rows[0];
    }
    const item = { id, filename, original_name, mime_type, size_bytes, created_at: new Date() };
    localMemoryStore.signatures.set(id, item);
    return item;
  },

  async getSignature(id) {
    if (isPgConnected && pool) {
      const res = await pool.query('SELECT * FROM signatures WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    return localMemoryStore.signatures.get(id) || null;
  },

  async getRecentSignatures(limit = 10) {
    if (isPgConnected && pool) {
      const res = await pool.query('SELECT * FROM signatures ORDER BY created_at DESC LIMIT $1', [limit]);
      return res.rows;
    }
    return Array.from(localMemoryStore.signatures.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }
};
