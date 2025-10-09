# Multi-stage Dockerfile for Next.js (production)

FROM node:20-alpine AS base
WORKDIR /app

# 换国内源并安装 OpenSSL 和 Prisma 依赖
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache openssl openssl-dev

# 1) Install deps in a clean layer
FROM base AS deps
COPY package*.json ./
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm ci

# 2) Build the app
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# 3) Production image
FROM base AS prod
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# 换国内源并安装 OpenSSL for Prisma in production
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache openssl

# Copy required artifacts
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

EXPOSE 3000
CMD ["npm","run","start"]