# Drive BillonMail

Solución integral para colaboradores de empresa para:
1. **Transferir archivos y videos grandes (>10MB):** Evita rebotes por límite SMTP en BillonMail. Genera enlaces de descarga/streaming directos con caducidad automática (TTL).
2. **Alojamiento corporativo de imágenes y GIFs para firmas:** Aloja firmas en servidores propios y genera enlaces directos (`.gif`/`.png`), HTML y Markdown estilo Postimages para insertar en BillonMail sin aumentar el peso del correo.

---

## 🛠️ Stack Tecnológico
- **Frontend:** React 19 + Vite (Estética sobria, responsive, anti-IA).
- **Backend:** Node.js (Express, Multer con streaming en disco, HTTP Range Requests para video).
- **Base de Datos:** PostgreSQL con auto-migración de esquema al iniciar.
- **Despliegue:** Dokploy (VPS) vía Dockerfile multi-stage o Docker Compose.

---

## 🚀 Puesta en Marcha Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar `.env` (Opcional en desarrollo)
Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```
*(Si no tienes PostgreSQL encendido en tu máquina local, el backend iniciará en modo desarrollo resiliente sin interrumpir tu flujo).*

### 3. Ejecutar en modo desarrollo
* **Servidor backend (puerto 3000):**
  ```bash
  npm run dev:server
  ```
* **Cliente Vite con recarga rápida (puerto 5173):**
  ```bash
  npm run dev:client
  ```

---

## 🐳 Despliegue en Dokploy (VPS)

### Opción A: Aplicación Dokploy (Recomendada con Dockerfile)
1. En Dokploy, crea una nueva **Application** conectada a tu repositorio GitHub.
2. Selecciona Build Type: **Dockerfile**.
3. En la pestaña **Environment**, define:
   - `PORT=3000`
   - `APP_URL=https://tu-dominio.com`
   - `DATABASE_URL=postgresql://usuario:pass@postgres_host:5432/drive_billonmail`
4. En la pestaña **Volumes**, mapea para no perder archivos en cada despliegue:
   - Host path: `/var/dokploy/drive/files` $\rightarrow$ Container path: `/app/server/uploads/files`
   - Host path: `/var/dokploy/drive/signatures` $\rightarrow$ Container path: `/app/server/uploads/signatures`
5. Clic en **Deploy**.

### Opción B: Stack Dokploy (Compose)
Si deseas que Dokploy cree automáticamente PostgreSQL junto a la aplicación, usa la opción **Compose** y apunta al archivo `docker-compose.yml`.

---

## 📂 Estructura del Repositorio
```
Drive_billonmail/
├── client/                      # Frontend Vite + React
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileTransfer.jsx     # Subida de videos y archivos >10MB
│   │   │   ├── SignatureHosting.jsx # Alojador de GIFs/Imágenes tipo Postimages
│   │   │   ├── RecipientView.jsx    # Visor público del cliente (/v/:id)
│   │   │   └── Toast.jsx
│   │   ├── App.jsx
│   │   └── index.css
├── server/                      # Backend Node.js
│   ├── src/
│   │   ├── config.js
│   │   ├── db.js                # PostgreSQL + pool + auto-migración
│   │   ├── storage.js           # Manejo de disco
│   │   ├── cron.js              # Limpieza por TTL
│   │   ├── routes/
│   │   │   ├── files.js         # Subida por streaming y streaming de video
│   │   │   └── signatures.js    # Firmas y enlaces estilo Postimages
│   │   └── index.js             # Express app
│   └── uploads/
├── Dockerfile                   # Build multi-stage para Dokploy
├── docker-compose.yml           # App + PostgreSQL
└── .env.example
```
