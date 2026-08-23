# syntax=docker/dockerfile:1

# ============================================================
#  Ultrasound API — мультистейдж сборка
#  Этап 5.1: сборка и запуск на сервере через Docker Compose
# ============================================================

# ---------- Стадия сборки ----------
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Кэшируем слой с зависимостями
COPY package.json package-lock.json ./
RUN npm ci

# Генерируем Prisma Client по схеме (БД не требуется)
COPY prisma ./prisma
RUN npx prisma generate

# Компилируем TypeScript -> dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Финальный образ ----------
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Prisma engine требует libssl/openssl (без него query engine может не запуститься)
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Node-модули целиком (включая prisma CLI — нужен для `prisma migrate deploy`)
COPY --from=builder /app/node_modules ./node_modules
# Скомпилированный код
COPY --from=builder /app/dist ./dist
# Prisma-схема и миграции
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000

# Применяем миграции и запускаем API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
