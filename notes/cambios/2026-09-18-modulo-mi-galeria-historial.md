# Cambio: Implementación del Módulo "Mi Galería / Historial"

- **Fecha:** 2026-09-18
- **Tipo:** Feature / Frontend & Backend / UI
- **Estado:** Completado
- **Contexto / Objetivo:** Crear un apartado dedicado para que los colaboradores puedan consultar el historial de archivos pesados enviados (con estado de expiración y descargas) y tener una galería visual de sus firmas y GIFs alojados para reutilizar sus enlaces sin tener que subirlos nuevamente.

---

## Archivos Creados / Modificados
- `server/src/db.js` (migración de columna user_id en transfers y signatures, consultas getUserTransfers y getUserSignatures)
- `server/src/routes/files.js` (endpoints /my y DELETE)
- `server/src/routes/signatures.js` (endpoints /my y DELETE)
- `client/src/components/GalleryHistory.jsx` (componente visual de galería e historial con sub-pestañas)
- `client/src/App.jsx` (incorporación de pestaña en la navegación)

---

## Verificación
- Endpoints de consulta y eliminación verificados con autenticación por token.
- Migración no destructiva de esquema de base de datos (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS user_id`).
- Compilación de frontend Vite en 1.07s limpia.
