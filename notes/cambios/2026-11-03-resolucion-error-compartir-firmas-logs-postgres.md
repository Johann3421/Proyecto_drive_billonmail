# Cambio: Resolución de Error al Compartir Firmas/GIFs y Filtrado de Logs en PostgreSQL

- **Fecha:** 2026-11-03
- **Tipo:** Bugfix / Security & Feature Enhancement
- **Estado:** Completado

---

## 1. Análisis de los Logs de PostgreSQL (`invalid length of startup packet`, `unsupported frontend protocol 0.0`)
- **Causa raíz:** En `docker-compose.yml`, el servicio `postgres` exponía el puerto `5446:5432` a `0.0.0.0`. Docker modifica `iptables` exponiendo el puerto directamente a Internet público saltándose el firewall UFW.
- **Efecto:** Escáneres de puertos masivos y bots de Internet (Shodan, Censys, masscan) detectaban el puerto 5446 abierto y le enviaban peticiones HTTP (`GET /`) y paquetes de handshake TLS. Postgres esperaba el protocolo 3.0 de PostgreSQL y registraba errores de longitud inválida de paquete y falta de nombre de usuario.
- **Solución:** Vincular el puerto estrictamente a localhost (`127.0.0.1:5446:5432`). El contenedor `app` se comunica con PostgreSQL internamente por la red Docker `default` (`postgres:5432`), impidiendo que bots externos tengan acceso.

---

## 2. Análisis del Error al Compartir Imágenes y GIFs
- **Causa raíz 1 (Falta de Visor Público `/i/:id`):**
  - Al subir una firma o GIF, el sistema genera un "Enlace de visor" público (`https://drive.sekaitech.com.pe/i/:id`).
  - Sin embargo, `App.jsx` solo interceptaba `/v/:id` (para descargas de archivos grandes). Cuando un destinatario externo o cliente abría `/i/:id`, la aplicación no reconocía la ruta y lo forzaba a la pantalla de login con credenciales corporativas (`AuthModal`), impidiendo ver la imagen.
  - Además, el backend carecía del endpoint público `GET /api/signatures/:id/meta`.
- **Causa raíz 2 (Cabeceras CORS y CORP para Clientes de Correo):**
  - Los clientes de correo y webmails (Gmail, Outlook 365, BillonMail webmail) cargan imágenes desde proxies o sandbox con políticas estrictas COEP/CORP. La ruta `/uploads/firmas` carecía de las cabeceras `Cross-Origin-Resource-Policy: cross-origin` y `Access-Control-Allow-Origin: *`, lo cual podía bloquear la previsualización directa en el cuerpo de los correos.

---

## 3. Acciones y Mejoras Implementadas
1. **Nuevo Componente Visor Público (`client/src/components/ImageViewer.jsx`):**
   - Interfaz pública responsiva para `/i/:id` que no requiere login.
   - Vista previa con cuadrícula para transparencias, información de peso, formato y resolución.
   - Botones rápidos de copiado (Enlace Directo, Código HTML, Markdown) y botón de descarga directa.
2. **Endpoints Públicos en Backend (`server/src/routes/signatures.js`, `server/src/index.js`):**
   - `GET /api/signatures/:id/meta`: Endpoint público para consultar metadatos del visor.
   - `GET /api/signatures/:id/raw`: Endpoint directo de streaming de imagen con cabeceras completas.
   - `GET /s/:id`: Enlace corto directo para incrustar firmas en correos.
   - Cabeceras añadidas en `/uploads/firmas`: `Cross-Origin-Resource-Policy: cross-origin`, `Access-Control-Allow-Origin: *` y caché inmutable de 30 días.
3. **Seguridad en Docker Compose (`docker-compose.yml`):**
   - `127.0.0.1:5446:5432` para bloquear escaneos externos.

---

## Archivos Modificados
- `docker-compose.yml`
- `server/src/index.js`
- `server/src/routes/signatures.js`
- `client/src/App.jsx`
- `client/src/components/ImageViewer.jsx`
- `client/src/components/GalleryHistory.jsx`
- `client/src/components/SignatureHosting.jsx`
- `server/public/*` (recompilación de frontend con Vite)
