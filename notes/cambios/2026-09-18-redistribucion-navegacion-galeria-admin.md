# Cambio: Redistribución de Navegación (Separación de Galería y Aprobación de Usuarios)

- **Fecha:** 2026-09-18
- **Tipo:** Refactor / UX Enhancement
- **Estado:** Completado

---

## Contexto y Objetivo
El usuario solicitó separar las opciones de "Mi Galería" y "Aprobación de Usuarios" del área de subida de archivos/imágenes. Anteriormente, las 4 pestañas estaban juntas horizontalmente en la vista principal numeradas del 1 al 4, generando desorden visual y mezclando herramientas de subida con módulos de consulta histórica y gestión administrativa.

---

## Cambios Realizados
1. **Navegación Global en el Header (`client/src/App.jsx`, `client/src/index.css`):**
   - Se crearon botones de navegación de primer nivel en el encabezado superior:
     - `Subir Archivos` (acceso directo a herramientas de subida).
     - `Mi Galería` (acceso al espacio personal de imágenes/firmas y transferencias).
     - `Aprobación de Usuarios` (exclusivo para SuperAdmin, con indicador numérico dinámico de solicitudes pendientes).
   - Estilizado profesional con estados `:hover` y `.active` en paleta corporativa anti-IA.
2. **Sub-apartado Exclusivo de Carga (`currentSection === 'upload'`):**
   - El selector principal ahora solo ofrece alternar entre las 2 herramientas de subida:
     - `Archivos Grandes (>10MB)` (FileTransfer)
     - `Firmas & GIFs para Correos` (SignatureHosting)
   - Eliminado todo el ruido de opciones ajenas a la carga de archivos.
3. **Módulo Administrativo Sincronizado (`AdminPanel.jsx`):**
   - Implementado callback `onPendingCountChange` para actualizar en tiempo real el contador en la barra de navegación del SuperAdmin.
4. **Diseño Responsivo:**
   - Adaptación en CSS para que en dispositivos móviles o pantallas reducidas la barra de navegación y las acciones de usuario se acomoden limpiamente.

---

## Archivos Modificados
- `client/src/App.jsx`: Reestructuración del estado (`currentSection`, `uploadTab`), navegación en header y renderizado condicional por apartados.
- `client/src/index.css`: Clases `.header-brand-nav`, `.header-nav`, `.nav-btn`, `.nav-badge`, `.header-user-actions`, `.btn-logout`, `.upload-header-bar` y media queries.
- `client/src/components/AdminPanel.jsx`: Soporte para notificar conteo de pendientes a la barra de navegación.
- `server/public/*`: Recompilación limpia de los assets para producción.

---

## Próximos Pasos
- Desplegar cambios en GitHub `main` para que Dokploy actualice la instancia en `https://drive.sekaitech.com.pe`.
