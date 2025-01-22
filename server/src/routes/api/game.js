// server/src/routes/api/game.js
import express from 'express';
import gameController from '../../controllers/gameController';

const router = express.Router();

// Ruta para crear un nuevo juego
router.post('/create', gameController.initializeGame);

// Ruta para unirse a un juego existente
router.post('/join', gameController.joinGame);

// Ruta para obtener el estado actual del juego
router.get('/:gameId/state', gameController.getGameState);

// Ruta para salir de un juego
router.post('/leave', gameController.leaveGame);

// Ruta para hacer una jugada (por ejemplo, mover una pieza)
router.post('/:gameId/action', gameController.handlePlayerAction);

// Ruta para finalizar el juego
router.post('/:gameId/end', gameController.endGame);

export default router;
