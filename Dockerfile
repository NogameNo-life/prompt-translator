# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Установим зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Копируем исходники
COPY . .

# Собираем приложение
RUN npm run build

# Финальный образ
FROM node:18-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

# Устанавливаем только продакшн-зависимости
COPY package.json package-lock.json* ./
RUN npm install --production

# Копируем только необходимые файлы из builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/lib ./lib

EXPOSE 3000

# Запуск Next.js
CMD ["npx", "next", "start"]
