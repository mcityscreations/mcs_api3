# --- BUILD ---
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
RUN npm run build

# --- RUN ---
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=root:root --chmod=755 /app/package*.json ./
COPY --from=builder --chown=root:root --chmod=755 /app/node_modules ./node_modules
COPY --from=builder --chown=root:root --chmod=755 /app/dist ./dist
USER node
EXPOSE 4000
CMD ["node", "dist/main"]