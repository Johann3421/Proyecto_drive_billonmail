import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { hashPassword, verifyPassword, createToken, requireAuth, requireSuperAdmin } from '../auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Debes ingresar correo y contraseña.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Comprobar estado de aprobación
    if (user.status === 'pending') {
      return res.status(403).json({
        error: 'Tu cuenta está pendiente de aprobación por el SuperAdmin antes de poder ingresar.'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        error: 'Tu cuenta ha sido suspendida o rechazada. Contacta a soporte.'
      });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Ingresa un correo corporativo válido.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const existing = await db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con este correo electrónico.' });
    }

    const { hash, salt } = hashPassword(password);
    const id = crypto.randomBytes(6).toString('hex');

    const newUser = await db.createUser({
      id,
      email: cleanEmail,
      password_hash: hash,
      salt,
      name: name?.trim() || cleanEmail.split('@')[0],
      role: 'user',
      status: 'pending' // Requiere aprobación del SuperAdmin
    });

    return res.status(201).json({
      success: true,
      message: 'Tu solicitud de registro ha sido enviada. El SuperAdmin debe aprobar tu cuenta para que puedas iniciar sesión.',
      user: newUser
    });
  } catch (err) {
    console.error('Error en register:', err);
    return res.status(500).json({ error: 'Error al procesar el registro.' });
  }
});

// GET /api/auth/me - Perfil del usuario actual
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    return res.json({ success: true, user });
  } catch (err) {
    console.error('Error en /me:', err);
    return res.status(500).json({ error: 'Error al obtener sesión.' });
  }
});

// GET /api/auth/admin/users - Listado de usuarios (Solo SuperAdmin)
router.get('/admin/users', requireSuperAdmin, async (req, res) => {
  try {
    const users = await db.listUsers();
    return res.json({ success: true, users });
  } catch (err) {
    console.error('Error en /admin/users:', err);
    return res.status(500).json({ error: 'Error al listar usuarios.' });
  }
});

// POST /api/auth/admin/users/:id/status - Aprobar o Rechazar usuario (Solo SuperAdmin)
router.post('/admin/users/:id/status', requireSuperAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido. Use approved, rejected o pending.' });
    }

    const targetUser = await db.findUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Evitar que el superadmin se auto-desapruebe
    if (targetUser.role === 'superadmin' && status !== 'approved') {
      return res.status(400).json({ error: 'No se puede revocar la cuenta principal del SuperAdmin.' });
    }

    const updated = await db.updateUserStatus(req.params.id, status);
    return res.json({ success: true, user: updated });
  } catch (err) {
    console.error('Error al actualizar estado de usuario:', err);
    return res.status(500).json({ error: 'Error al actualizar usuario.' });
  }
});

export default router;
