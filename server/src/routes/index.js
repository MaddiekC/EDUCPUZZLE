import express from 'express';
import gameRoutes from './api/game.js';
import playerRoutes from './api/player.js';  // Aquí debes importar playerRoutes
import authRoutes from './api/auth.js';

const router = express.Router();

// Definir las rutas de la API
router.use('/game', gameRoutes);   // Aquí defines las rutas de juego bajo /api/game
router.use('/player', playerRoutes); // Aquí defines las rutas de jugadores bajo /api/player
router.use('/auth', authRoutes);  // Aquí defines las rutas de autenticación bajo /api/auth

// Ruta principal
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'EDUCPUZZLE API - Server is running',
        status: 'OK',
    });
});

export default router;
