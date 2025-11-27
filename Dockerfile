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
RUN npm run build && npm prune --production && npm cache clean --force

# Build du client Next.js
WORKDIR /app/client/heros-faith
RUN npm run build && npm prune --production && npm cache clean --force

# Stage 2: Production - Ultra optimisé
FROM node:20-alpine AS runner

# Installer uniquement les dépendances système nécessaires
RUN apk add --no-cache dumb-init

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# === BACKEND ===
# Copier les dépendances de production du serveur depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app/server/package*.json ./server/
COPY --from=builder --chown=nodejs:nodejs /app/server/node_modules ./server/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/server/dist ./server/dist

# Copier les fichiers .env pour la production
COPY --chown=nodejs:nodejs server/.env.production ./server/.env

# === FRONTEND ===
# Next.js standalone génère un serveur minimal avec toutes les dépendances nécessaires
# Le serveur standalone est dans .next/standalone/client/heros-faith/
COPY --from=builder --chown=nodejs:nodejs /app/client/heros-faith/.next/standalone/client/heros-faith ./client/heros-faith
COPY --from=builder --chown=nodejs:nodejs /app/client/heros-faith/.next/static ./client/heros-faith/.next/static

# Copier le fichier .env.production pour le frontend (Next.js l'utilisera automatiquement)
COPY --chown=nodejs:nodejs client/heros-faith/.env.production ./client/heros-faith/.env.production

# Créer le répertoire uploads avec les bonnes permissions
RUN mkdir -p /app/server/uploads && \
    chown -R nodejs:nodejs /app/server/uploads && \
    chmod -R 755 /app/server/uploads

# Définir la variable d'environnement pour le chemin des uploads
ENV UPLOAD_DIR=/app/server/uploads

# Script de démarrage optimisé avec logs
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "🔍 [Docker] Vérification du répertoire uploads..."' >> /app/start.sh && \
    echo 'ls -la /app/server/ || echo "❌ Impossible de lister /app/server/"' >> /app/start.sh && \
    echo 'ls -la /app/server/uploads/ || echo "❌ Impossible de lister /app/server/uploads/"' >> /app/start.sh && \
    echo 'echo "📁 [Docker] UPLOAD_DIR=${UPLOAD_DIR}"' >> /app/start.sh && \
    echo 'echo "🚀 Démarrage du backend..."' >> /app/start.sh && \
    echo 'cd /app/server && node dist/server.js &' >> /app/start.sh && \
    echo 'SERVER_PID=$!' >> /app/start.sh && \
    echo 'echo "🌐 Démarrage du frontend..."' >> /app/start.sh && \
    echo 'cd /app/client/heros-faith && PORT=3001 node server.js &' >> /app/start.sh && \
    echo 'CLIENT_PID=$!' >> /app/start.sh && \
    echo 'echo "✅ Application démarrée - Backend: $SERVER_PID, Frontend: $CLIENT_PID"' >> /app/start.sh && \
    echo 'wait $SERVER_PID $CLIENT_PID' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nodejs:nodejs /app/start.sh

# Exposer les ports
EXPOSE 3000 3001

# Variables d'environnement
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Changer vers l'utilisateur non-root
USER nodejs

# Utiliser dumb-init pour une gestion correcte des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["/app/start.sh"]

