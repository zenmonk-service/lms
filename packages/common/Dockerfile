FROM node:20.13.1-slim
WORKDIR /monorepo
COPY package*.json ./
COPY packages/common ./packages/common
RUN npm install
RUN npm run build --workspace=packages/common