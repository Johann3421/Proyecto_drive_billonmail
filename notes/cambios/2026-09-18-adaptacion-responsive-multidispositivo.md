# Cambio: Adaptación Responsive para Móviles y Múltiples Dispositivos

- **Fecha:** 2026-09-18
- **Tipo:** UI / Responsive Enhancement
- **Estado:** Completado

---

## Contexto y Objetivo
El usuario solicitó verificar y garantizar la adaptabilidad responsive de toda la plataforma en dispositivos móviles (smartphones, tablets y pantallas compactas), asegurando que ninguna tabla, barra de navegación, formulario o modal se desborde o se vea recortado.

---

## Mejoras y Adaptaciones Realizadas
1. **Navegación Superior en Móvil (`index.css`):**
   - Header adaptable con disposición vertical limpia (`flex-direction: column; align-items: stretch`).
   - Barra de navegación con desplazamiento táctil horizontal suave sin barra de scroll antiestética (`-webkit-overflow-scrolling: touch; scrollbar-width: none`).
   - Truncado automático de correos corporativos largos (`.user-email-text` con `text-overflow: ellipsis`) para evitar desbordes en pantallas estrechas (<480px y 360px).
2. **Selectores y Herramientas de Carga:**
   - La barra de alternancia entre subida de videos y firmas (`.tab-bar`) se expande al 100% en pantallas móviles distribuyendo el ancho equitativamente con tipografía adaptada.
   - Zona de arrastre (`.dropzone`) optimizada con menor padding vertical para evitar scrolls excesivos en teléfonos.
   - Filas de copia de enlaces (`.link-copy-row`) y opciones de expiración (`.options-row`) se apilan verticalmente en pantallas móviles garantizando botones con área táctil cómoda.
3. **Módulo de Galería e Historial (`GalleryHistory.jsx`):**
   - Barra de alternancia de galería (`.gallery-toggle-bar`) apilable en móviles para fácil pulsación con el pulgar.
   - Cuadrícula de firmas (`.gallery-grid`) adaptada a 1 columna completa en pantallas reducidas.
   - Historial de transferencias con contenedor `.table-responsive` y tabla estilizada (`.data-table`) sin romper el diseño de la tarjeta.
   - Modal emergente con `max-height: 90vh` y scroll interno (`overflow-y: auto`), evitando cortes en pantallas pequeñas.
4. **Panel Administrativo y Autenticación (`AdminPanel.jsx`, `AuthModal.jsx`):**
   - Tabla de usuarios con contenedor deslizable y tarjeta de login/registro `.auth-card` con márgenes y paddings dinámicos.
   - Barra de estadísticas (`.admin-stats-bar`) responsiva.
5. **Prevención de Zoom no Deseado en iOS Safari:**
   - Inputs y selects configurados con `font-size: 16px` en vista móvil para evitar que Safari amplíe bruscamente la pantalla al tocar un campo.

---

## Archivos Modificados
- `client/src/index.css`: Utilidades responsivas (`.gallery-toggle-bar`, `.gallery-grid`, `.table-responsive`, `.data-table`, `.modal-overlay`, `.modal-content`, `.auth-card`) y media queries (768px, 640px, 480px).
- `client/src/App.jsx`: Clase `.user-email-text` para email adaptable.
- `client/src/components/GalleryHistory.jsx`: Integración de clases responsivas en conmutador, grid, tabla y modal.
- `client/src/components/AdminPanel.jsx`: Integración de `.admin-stats-bar` y `.table-responsive`.
- `client/src/components/AuthModal.jsx`: Integración de clase responsiva `.auth-card`.
- `server/public/*`: Recompilación de producción con Vite.

---

## Próximos Pasos
- Subir a GitHub `main` para despliegue automático en Dokploy (`https://drive.sekaitech.com.pe`).
