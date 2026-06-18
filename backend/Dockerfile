FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY dist ./dist
COPY prisma ./prisma

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/index.js"]
