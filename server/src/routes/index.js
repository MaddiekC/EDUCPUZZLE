import express from 'express';
import gameRoutes from './api/game.js';
import playerRoutes from './api/player.js';
import authRoutes from './api/auth.js';

const router = express.Router();

// Definir las rutas de la API
router.use('/game', gameRoutes);
router.use('/player', playerRoutes);
router.use('/auth', authRoutes);

// Ruta principal
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'EDUCPUZZLE API - Server is running',
        status: 'OK',
    });
});

export default router;