# Usamos una imagen oficial y liviana de Node.js (versión 20 incluye 'fetch' nativo)
FROM node:20-slim

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production

COPY . .

# Cloud Run inyecta la variable de entorno PORT, por defecto es 8080
CMD [ "npm", "start" ]