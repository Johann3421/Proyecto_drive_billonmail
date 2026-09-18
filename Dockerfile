# =========================================================
# STAGE 1: Build Vite Client
# =========================================================
FROM node:22-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# =========================================================
# STAGE 2: Server & Runtime
# =========================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Dependencias del servidor
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Código fuente del backend
COPY server/src ./server/src

# Copiar la carpeta compilada del frontend generada en el Stage 1
COPY --from=client-builder /app/server/public ./server/public

# Carpetas para uploads
RUN mkdir -p /app/server/uploads/files /app/server/uploads/signatures

EXPOSE 3000

WORKDIR /app/server
CMD ["node", "src/index.js"]
