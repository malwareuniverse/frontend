FROM node:24-alpine AS builder

# Non-root User erstellen
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci && npm cache clean --force

COPY --chown=nextjs:nodejs . .
RUN chown -R nextjs:nodejs /app

USER nextjs

ENV FASTAPI_URL="https://reducer.malwareuniverse.org/"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-alpine AS runner

# System Updates und nur notwendige Pakete
RUN apk update && apk upgrade && apk add --no-cache dumb-init && rm -rf /var/cache/apk/*

# Non-root User erstellen
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# Nur Production Dependencies kopieren
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force && rm -rf /tmp/*

# Built Application von Builder Stage kopieren
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Read-only Root Filesystem vorbereiten
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next/cache

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production


CMD ["node", "server.js"]