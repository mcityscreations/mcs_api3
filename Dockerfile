# --- BUILD ---
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
RUN npm run build

# --- RUN ---
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
RUN mkdir -p logs && chown node:node logs && chmod 755 logs
COPY --from=builder --chown=root:root --chmod=755 /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder --chown=root:root --chmod=755 /app/dist ./dist
USER node
EXPOSE 4000
CMD ["node", "dist/main"]