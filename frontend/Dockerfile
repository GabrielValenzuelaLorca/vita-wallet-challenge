# syntax=docker/dockerfile:1

# --- Stage 1: build the production bundle with Vite ---------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Cache npm install separately from app code.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: serve the static bundle through nginx ---------------------------
FROM nginx:1.27-alpine

# Custom nginx config: SPA fallback to index.html + reverse-proxy /api → backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
