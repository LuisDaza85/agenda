# Usa Node.js versión 18
FROM node:18-alpine

#  Establece la carpeta de trabajo
WORKDIR /app


COPY package*.json ./

RUN npm ci

# Copia todo el código
COPY . .

# Expone el puerto 5000
EXPOSE 5000

# Comando para iniciar el servidor
CMD ["npm", "run", "dev"]