# =============================================================================
# DOCKERFILE — Frontend Next.js (Ticketon)
# =============================================================================
#
# Estrutura idêntica ao Dockerfile do backend, mas para o Next.js.
# Leia os comentários do tcc-back/Dockerfile para a explicação detalhada
# sobre FROM, WORKDIR, COPY, RUN, EXPOSE e CMD.
#
# Este arquivo é "simples" porque estamos em modo desenvolvimento.
# Para produção, o Dockerfile do Next.js seria multi-stage (veja abaixo).
# =============================================================================

# Mesma base do backend: Node 18 em Alpine Linux
FROM node:18-alpine

# Define /app como diretório de trabalho dentro do container
WORKDIR /app

# -----------------------------------------------------------------------------
# Copia manifesto de dependências ANTES do código-fonte
# -----------------------------------------------------------------------------
# Estratégia de cache: o npm install só roda novamente se o package.json
# ou package-lock.json mudarem. Como esses arquivos mudam raramente
# comparado ao código, economizamos tempo no rebuild.
COPY package*.json ./

# Instala as dependências do Next.js e React
RUN npm install

# -----------------------------------------------------------------------------
# O código-fonte é montado via volume no docker-compose.yml
# -----------------------------------------------------------------------------
# Assim como no backend, NÃO copiamos o código aqui.
# O docker-compose monta ./tcc-front como volume em /app, permitindo
# que o Next.js em modo `dev` detecte mudanças e recarregue a página
# automaticamente (Fast Refresh).

EXPOSE 3000

# `npm run dev` inicia o servidor de desenvolvimento do Next.js
# com Fast Refresh ativado — alterações no código aparecem no browser
# em menos de 1 segundo, sem recarregar a página inteira.
CMD ["npm", "run", "dev"]

# =============================================================================
# COMO SERIA EM PRODUÇÃO (Multi-stage build)
# =============================================================================
# Em produção, usaríamos um Dockerfile com múltiplos estágios para criar
# uma imagem final muito menor e mais segura:
#
# # Estágio 1: Build
# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build
#
# # Estágio 2: Runtime (imagem final minúscula)
# FROM node:18-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV production
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# EXPOSE 3000
# CMD ["node", "server.js"]
#
# Com multi-stage, a imagem final não inclui as devDependencies, o código
# TypeScript original, nem o compilador — apenas o JavaScript buildado.
# Resultado: imagem de ~100MB em vez de ~800MB.
# =============================================================================
