FROM node:20.13.1-alpine3.20 AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

FROM node:20.13.1-alpine3.20
WORKDIR /app

COPY --from=base /app /app
USER node

EXPOSE 8080
CMD ["npm", "run", "start"]
