import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes';
import { connectDatabase } from '../config/database';

// Cargar las variables de entorno
dotenv.config();

// Crear una instancia de Express
const app = express();

// Conectar a la base de datos
connectDatabase();

// Middleware
app.use(cors());
app.use(express.json()); // Para analizar los cuerpos de las solicitudes JSON

// Rutas
app.use('/api', routes); // Asumiendo que tienes un archivo de rutas index.js

// Definir el puerto del servidor
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
