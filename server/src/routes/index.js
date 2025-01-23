import express from 'express';
// Corregimos las rutas de importación añadiendo .js y ajustando las rutas
import gameRoutes from './routes/api/game.js';
import playerRoutes from './routes/api/player.js';
import authRoutes from './routes/api/auth.js';

const router = express.Router();

// Ruta base para el estado del servidor
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'EDUCPUZZLE API - Server is running',
        status: 'OK',
    });
});

// Rutas específicas de la API
router.use('/game', gameRoutes);
router.use('/player', playerRoutes);
router.use('/auth', authRoutes);

// Middleware para manejar rutas no encontradas
router.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
    });
});

export default router;