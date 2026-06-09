FROM node:20-alpine AS deps
WORKDIR /app

COPY mobile/package.json mobile/package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS dev
WORKDIR /app

ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

COPY --from=deps /app/node_modules ./node_modules
COPY mobile/ .

EXPOSE 8081 19000 19001 19002

CMD ["npx", "expo", "start", "--lan"]
