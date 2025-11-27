# Dockerfile multi-stage pour Hero's Faith
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers package.json
COPY package*.json ./
COPY client/heros-faith/package*.json ./client/heros-faith/
COPY server/package*.json ./server/

# Installer les dépendances séparément pour éviter les problèmes de mémoire
RUN npm install --legacy-peer-deps

WORKDIR /app/client/heros-faith
RUN npm install --legacy-peer-deps

WORKDIR /app/server
RUN npm install --legacy-peer-deps

WORKDIR /app

# Copier uniquement le code source (pas les node_modules)
COPY server/src ./server/src
COPY server/tsconfig.json ./server/
COPY client/heros-faith/src ./client/heros-faith/src
COPY client/heros-faith/*.config.* ./client/heros-faith/
COPY client/heros-faith/*.json ./client/heros-faith/
COPY client/heros-faith/.env* ./client/heros-faith/

# Build du serveur TypeScript
WORKDIR /app/server
RUN npm run build

# Build du client Next.js
WORKDIR /app/client/heros-faith
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Créer le répertoire uploads
RUN mkdir -p /app/server/uploads

# Copier les fichiers package.json
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/client/heros-faith/package*.json ./client/heros-faith/

# Installer UNIQUEMENT les dépendances de production (séparément pour éviter les problèmes QEMU)
RUN npm install --omit=dev --legacy-peer-deps

WORKDIR /app/server
RUN npm install --omit=dev --legacy-peer-deps

WORKDIR /app/client/heros-faith
RUN npm install --omit=dev --legacy-peer-deps

WORKDIR /app

# Copier uniquement les builds
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/heros-faith/.next ./client/heros-faith/.next
COPY --from=builder /app/client/heros-faith/next.config.ts ./client/heros-faith/

# Exposer les ports (3000 = backend, 3001 = frontend)
EXPOSE 3000 3001

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["npm", "start"]

