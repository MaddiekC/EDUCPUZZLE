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

// Middleware: Permitir solicitudes desde cualquier origen, incluso para solicitudes con credenciales
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
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
        url: 'http://192.168.100.13:5000/',
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
  apis: ['./src/routes/api/*.js'],
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Documentación Swagger disponible en: http://192.168.100.13:5000/api-docs`);
});