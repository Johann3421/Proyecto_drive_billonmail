# Bóveda de Notas - Drive BillonMail

## Resumen del Proyecto
Sistema interno para colaboradores de la empresa que resuelve:
1. Transferencia y alojamiento temporal de archivos grandes (>10MB) mediante enlaces de descarga/streaming para evitar el límite de BillonMail.
2. Generador y alojamiento centralizado de firmas corporativas (footers) estandarizadas en HTML.

---

## Decisiones de Arquitectura
- **Despliegue:** VPS propio con Dokploy y CI/CD desde GitHub.
- **Backend:** Node.js (Fastify/Express con streaming y límites de carga).
- **Frontend:** Vite + React/Vue (diseño anti-IA, limpio, UX directo).
- **Base de Datos:** PostgreSQL.

---

## Historial de Cambios y Sesiones
- [[notes/cambios/2026-09-18-adaptacion-responsive-multidispositivo|2026-09-18 - Adaptación responsive completa para móviles y múltiples dispositivos]]
- [[notes/cambios/2026-09-18-redistribucion-navegacion-galeria-admin|2026-09-18 - Redistribución de navegación (separación de Galería y Aprobación de Usuarios)]]
- [[notes/cambios/2026-09-18-modulo-mi-galeria-historial|2026-09-18 - Módulo Mi Galería e Historial de archivos y firmas]]
- [[notes/cambios/2026-09-18-autenticacion-superadmin-dominio|2026-09-18 - Autenticación exclusiva, aprobación por SuperAdmin y dominio SekaiTech]]
- [[notes/cambios/2026-09-18-implementacion-sistema-completo|2026-09-18 - Plan e implementación del sistema completo Drive BillonMail]]
- [[notes/cambios/2026-09-18-plantillas-frontend|2026-09-18 - Creación de 3 plantillas HTML de diseño frontend anti-IA]]
