import pg from 'pg';
import crypto from 'crypto';
import { config } from './config.js';
import { hashPassword } from './auth.js';

const { Pool } = pg;

let pool = null;
let isPgConnected = false;

// Almacén en memoria para desarrollo local si PostgreSQL no está encendido
const localMemoryStore = {
  transfers: new Map(),
  signatures: new Map(),
  users: new Map()
};

const SUPERADMIN_EMAIL = 'loritox3421@gmail.com';
const SUPERADMIN_PASS = 'podereterno1';

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
        user_id VARCHAR(64),
        original_name TEXT NOT NULL,
        stored_name TEXT NOT NULL,
        mime_type VARCHAR(120),
        size_bytes BIGINT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        downloads_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE transfers ADD COLUMN IF NOT EXISTS user_id VARCHAR(64);
      CREATE INDEX IF NOT EXISTS idx_transfers_expires_at ON transfers (expires_at);
      CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON transfers (user_id);

      CREATE TABLE IF NOT EXISTS signatures (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type VARCHAR(120),
        size_bytes BIGINT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE signatures ADD COLUMN IF NOT EXISTS user_id VARCHAR(64);
      CREATE INDEX IF NOT EXISTS idx_signatures_user_id ON signatures (user_id);

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        name VARCHAR(120),
        role VARCHAR(20) DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        approved_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
    `);

    client.release();
    isPgConnected = true;
    console.log('✓ Conexión exitosa a PostgreSQL y tablas verificadas.');
  } catch (err) {
    isPgConnected = false;
    console.warn('⚠️  PostgreSQL no disponible o no accesible aún. Activando modo almacenamiento local resiliente.');
    console.warn(`    Detalle: ${err.message}`);
  }

  // Sembrar cuenta SuperAdmin obligatoria
  await seedSuperAdmin();
}

async function seedSuperAdmin() {
  try {
    const existing = await db.findUserByEmail(SUPERADMIN_EMAIL);
    if (!existing) {
      const { hash, salt } = hashPassword(SUPERADMIN_PASS);
      const id = crypto.randomBytes(6).toString('hex');
      await db.createUser({
        id,
        email: SUPERADMIN_EMAIL,
        password_hash: hash,
        salt,
        name: 'SuperAdmin SekaiTech',
        role: 'superadmin',
        status: 'approved',
        approved_at: new Date()
      });
      console.log(`👑 Cuenta SuperAdmin inicializada: ${SUPERADMIN_EMAIL}`);
    } else if (existing.role !== 'superadmin' || existing.status !== 'approved') {
      await db.updateUserStatus(existing.id, 'approved', 'superadmin');
    }
  } catch (err) {
    console.error('Error al inicializar SuperAdmin:', err.message);
  }
}

export const db = {
  // --- Transfers ---
  async saveTransfer({ id, user_id = null, original_name, stored_name, mime_type, size_bytes, expires_at }) {
    if (isPgConnected && pool) {
      const res = await pool.query(
        `INSERT INTO transfers (id, user_id, original_name, stored_name, mime_type, size_bytes, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [id, user_id, original_name, stored_name, mime_type, size_bytes, expires_at]
      );
      return res.rows[0];
    }
    const item = { id, user_id, original_name, stored_name, mime_type, size_bytes, expires_at, downloads_count: 0, created_at: new Date() };
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

  async getUserTransfers(userId, isAll = false) {
    if (isPgConnected && pool) {
      if (isAll) {
        const res = await pool.query('SELECT * FROM transfers ORDER BY created_at DESC');
        return res.rows;
      }
      const res = await pool.query('SELECT * FROM transfers WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return res.rows;
    }
    return Array.from(localMemoryStore.transfers.values())
      .filter(t => isAll || t.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

  // --- Signatures ---
  async saveSignature({ id, user_id = null, filename, original_name, mime_type, size_bytes }) {
    if (isPgConnected && pool) {
      const res = await pool.query(
        `INSERT INTO signatures (id, user_id, filename, original_name, mime_type, size_bytes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [id, user_id, filename, original_name, mime_type, size_bytes]
      );
      return res.rows[0];
    }
    const item = { id, user_id, filename, original_name, mime_type, size_bytes, created_at: new Date() };
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

  async getUserSignatures(userId, isAll = false) {
    if (isPgConnected && pool) {
      if (isAll) {
        const res = await pool.query('SELECT * FROM signatures ORDER BY created_at DESC');
        return res.rows;
      }
      const res = await pool.query('SELECT * FROM signatures WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return res.rows;
    }
    return Array.from(localMemoryStore.signatures.values())
      .filter(s => isAll || s.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async deleteSignature(id) {
    if (isPgConnected && pool) {
      await pool.query('DELETE FROM signatures WHERE id = $1', [id]);
      return;
    }
    localMemoryStore.signatures.delete(id);
  },

  async getRecentSignatures(limit = 10) {
    if (isPgConnected && pool) {
      const res = await pool.query('SELECT * FROM signatures ORDER BY created_at DESC LIMIT $1', [limit]);
      return res.rows;
    }
    return Array.from(localMemoryStore.signatures.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  },

  // --- Users & SuperAdmin ---
  async findUserByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (isPgConnected && pool) {
      const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      return res.rows[0] || null;
    }
    return localMemoryStore.users.get(cleanEmail) || null;
  },

  async findUserById(id) {
    if (isPgConnected && pool) {
      const res = await pool.query('SELECT id, email, name, role, status, created_at, approved_at FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    for (const u of localMemoryStore.users.values()) {
      if (u.id === id) {
        const { password_hash, salt, ...safe } = u;
        return safe;
      }
    }
    return null;
  },

  async createUser({ id, email, password_hash, salt, name, role = 'user', status = 'pending', approved_at = null }) {
    const cleanEmail = email.trim().toLowerCase();
    if (isPgConnected && pool) {
      const res = await pool.query(
        `INSERT INTO users (id, email, password_hash, salt, name, role, status, approved_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, name, role, status, created_at, approved_at`,
        [id, cleanEmail, password_hash, salt, name, role, status, approved_at]
      );
      return res.rows[0];
    }
    const user = { id, email: cleanEmail, password_hash, salt, name, role, status, created_at: new Date(), approved_at };
    localMemoryStore.users.set(cleanEmail, user);
    const { password_hash: ph, salt: s, ...safe } = user;
    return safe;
  },

  async listUsers() {
    if (isPgConnected && pool) {
      const res = await pool.query(
        'SELECT id, email, name, role, status, created_at, approved_at FROM users ORDER BY created_at DESC'
      );
      return res.rows;
    }
    return Array.from(localMemoryStore.users.values())
      .map(({ password_hash, salt, ...safe }) => safe)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async updateUserStatus(id, status, role = null) {
    const approved_at = status === 'approved' ? new Date() : null;
    if (isPgConnected && pool) {
      let query = 'UPDATE users SET status = $1, approved_at = $2';
      const params = [status, approved_at];
      if (role) {
        params.push(role);
        query += `, role = $${params.length}`;
      }
      params.push(id);
      query += ` WHERE id = $${params.length} RETURNING id, email, name, role, status, approved_at`;
      const res = await pool.query(query, params);
      return res.rows[0] || null;
    }
    for (const u of localMemoryStore.users.values()) {
      if (u.id === id) {
        u.status = status;
        u.approved_at = approved_at;
        if (role) u.role = role;
        const { password_hash, salt, ...safe } = u;
        return safe;
      }
    }
    return null;
  }
};
