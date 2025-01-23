# Usa una imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de tu proyecto al contenedor
COPY package*.json ./
COPY . .

# Instala las dependencias
RUN npm install

# Expone el puerto que usará la aplicación
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
