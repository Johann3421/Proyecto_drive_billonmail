# Cambio: Plan e Implementación del Sistema Completo Drive BillonMail

- **Fecha:** 2026-09-18
- **Tipo:** Feature / Fullstack Architecture / DevOps
- **Estado:** Completado
- **Contexto / Objetivo:** Construir la solución completa en producción (Node.js + Vite/React + PostgreSQL + Docker/Dokploy) que resuelve:
  1. Transferencia de archivos grandes (>10MB) con enlaces de descarga/streaming y expiración automática (TTL).
  2. Alojamiento corporativo de imágenes y GIFs para firmas con opciones de enlace estilo Postimages.
  3. Despliegue listo para Dokploy mediante Dockerfile multi-stage y docker-compose.

---

## Archivos Creados
- `server/src/index.js`, `server/src/db.js`, `server/src/storage.js`, `server/src/routes/files.js`, `server/src/routes/signatures.js`, `server/src/cron.js`
- `client/src/App.jsx`, `client/src/components/FileTransfer.jsx`, `client/src/components/SignatureHosting.jsx`, `client/src/components/RecipientView.jsx`, `client/src/components/Toast.jsx`, `client/src/index.css`
- `Dockerfile`, `docker-compose.yml`, `.env.example`, `package.json`, `README.md`

---

## Verificación
- Compilación Vite cliente: Exitosa en 1.26s hacia `server/public`.
- Prueba endpoints: `/api/health`, `/api/signatures/recent`, `/` (React SPA) respondiendo con HTTP 200.
- Modo resiliente verificado ante ausencia o fallo de credenciales locales de PostgreSQL.

---

## Decisiones de Arquitectura
1. **Contenedor Unificado para Dokploy:** Multi-stage build que compila Vite y sirve el frontend estático directamente desde Express/Fastify en producción. Evita problemas de CORS y reduce consumo de RAM en el VPS.
2. **Streaming en Disco para Archivos Grandes:** Multer escribiendo por streams a disco para soportar archivos de 1-2GB sin desbordar memoria.
3. **Persistencia PostgreSQL con Auto-Migración:** Creación de tablas idempotente al arrancar el servidor (`CREATE TABLE IF NOT EXISTS`).
4. **Limpieza TTL:** Tarea programada con `node-cron` para eliminar archivos expirados tanto de disco como de la base de datos.
