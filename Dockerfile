# /frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

EXPOSE 3000

# Comando de dev do Next.js
CMD ["npm", "run", "dev"]