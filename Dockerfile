FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json jest.config.cjs ./
COPY src ./src
COPY scripts ./scripts
COPY database ./database

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database ./database

EXPOSE 5000

CMD ["node", "dist/src/server.js"]
