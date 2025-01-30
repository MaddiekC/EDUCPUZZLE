// server/src/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/index.js';
import connectDB from '../config/database.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Cargar las variables de entorno
dotenv.config();

// Crear una instancia de Express
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Asegúrate de que sea la URL de tu frontend
  credentials: true
}));
app.use(express.json());

// Conectar a la base de datos
connectDB();

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EDUCPUZZLE API',
      version: '1.0.0',
      description: 'Documentación interactiva de la API de EDUCPUZZLE',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/api/*.js'], // Apuntar a tus rutas donde estén definidos los comentarios Swagger
};

// Generar los documentos Swagger
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Usar Swagger UI para visualizar la documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas
app.use('/api', routes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Definir el puerto del servidor
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Documentación Swagger disponible en: http://localhost:5000/api-docs`);
});