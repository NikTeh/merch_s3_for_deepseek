FROM node:20-alpine

WORKDIR /usr/src/app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install -g pm2 && \
    npm ci --only=production --no-optional

# Копируем код (игнорируем ненужное через .dockerignore)
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js"]