# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Установим зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Копируем исходники
COPY . .

# Сборка Next.js-приложения
RUN npm run build

# Финальный образ
FROM node:18-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

# Копируем нужные файлы
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

# Запуск Next.js
CMD ["npx", "next", "start"]
