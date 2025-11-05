#  Usa Node.js versión 18
FROM node:18-alpine

# Establece la carpeta de trabajo
WORKDIR /app

#  Copia los archivos de dependencias
COPY package*.json ./

#  Instala las dependencias
RUN npm ci

#  Copia todo el código
COPY . .

#  Expone el puerto 5173 (puerto por defecto de Vite)
EXPOSE 5173

#  Comando para iniciar el servidor de desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]