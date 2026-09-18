# Cambio: Autenticación Exclusiva, Aprobación por SuperAdmin y Dominio SekaiTech

- **Fecha:** 2026-09-18
- **Tipo:** Feature / Security / Auth / DevOps
- **Estado:** Completado
- **Contexto / Objetivo:** 
  1. Configurar el dominio oficial de producción `https://drive.sekaitech.com.pe`.
  2. Implementar sistema de autenticación exclusivo para colaboradores de la empresa.
  3. Flujo de registro con aprobación obligatoria por SuperAdmin (`loritox3421@gmail.com`).
  4. Mantener la vista de destinatarios `/v/:id` pública para clientes sin requerir login.

---

## Archivos Creados / Modificados
- `server/src/auth.js` (hashing scrypt, tokens HMAC-SHA256, middlewares)
- `server/src/routes/auth.js` (login, register, me, admin/users, admin/status)
- `server/src/db.js` (tabla users, seeding automático de SuperAdmin)
- `server/src/index.js`, `server/src/routes/files.js`, `server/src/routes/signatures.js`
- `client/src/components/AuthModal.jsx`, `client/src/components/AdminPanel.jsx`
- `client/src/App.jsx`, `client/src/components/FileTransfer.jsx`, `client/src/components/SignatureHosting.jsx`
- `docker-compose.yml`, `.env.example`, `server/src/config.js`, `README.md`

---

## Verificación
- Login de SuperAdmin (`loritox3421@gmail.com` / `podereterno1`): Exitoso con rol `superadmin`.
- Flujo de registro de empleado: Creado con estado `pending` y bloqueado con código 403.
- Panel de administración: Aprobación de colaborador en 1 clic y acceso inmediato desbloqueado.
- Compilación de frontend Vite completa y limpia en 1.08s hacia `server/public`.
