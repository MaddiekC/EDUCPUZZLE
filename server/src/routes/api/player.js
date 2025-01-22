// server/src/routes/api/player.js
import express from 'express';
import playerController from '../../controllers/playerController';

const router = express.Router();

// Ruta para crear un nuevo jugador
router.post('/create', playerController.createPlayer);

// Ruta para que un jugador se una a un juego
router.post('/join', playerController.joinGame);

// Ruta para que un jugador deje un juego
router.post('/leave', playerController.leaveGame);

// Ruta para actualizar las estadísticas del jugador
router.post('/update-stats', playerController.updatePlayerStats);

export default router;
