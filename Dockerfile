# ================================
# ESTÁGIO: Desenvolvimento (hot-reload)
# ================================
FROM node:20-alpine AS dev

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]

# ================================
# ESTÁGIO: Produção
# ================================
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node_modules/.bin/next", "start", "-p", "3002", "-H", "0.0.0.0"]
