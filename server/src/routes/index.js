const express = require('express');
const gameRoutes = require('./api/game');
const playerRoutes = require('./api/player');
const authRoutes = require('./api/auth');

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
router.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
    });
});

module.exports = router;
