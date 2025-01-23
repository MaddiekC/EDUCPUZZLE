import express from 'express';
import gameController from '../../controllers/gameController.js';
import Player from '../../models/Player.js';

const router = express.Router();

// Ruta para obtener todos los jugadores (solo un ejemplo)
router.get('/players', async (req, res) => {
  try {
    const players = await Player.find(); // Usar Player para obtener jugadores
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching players', error: error.message });
  }
});

// Rutas del controlador de juegos
router.post('/initialize', gameController.initializeGame);
router.post('/join', gameController.joinGame);
router.post('/action', gameController.handlePlayerAction);
router.post('/end', gameController.endGame);

export default router;
