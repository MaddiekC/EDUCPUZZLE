// server/src/routes/api/game.js
import express from 'express';
import gameController from '../../controllers/gameController.js';
import Player from '../../models/Player.js';

const router = express.Router();

/**
 * @swagger
 * /api/game/players:
 *   get:
 *     summary: Obtiene todos los jugadores.
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Lista de jugadores.
 *       500:
 *         description: Error en el servidor.
 */
router.get('/players', async (req, res) => {
  try {
    const players = await Player.find();
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching players', error: error.message });
  }
});

/**
 * @swagger
 * /api/game/initialize:
 *   post:
 *     summary: Inicializa un nuevo juego.
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Juego inicializado exitosamente.
 */
router.post('/initialize', gameController.initializeGame);

/**
 * @swagger
 * /api/game/join:
 *   post:
 *     summary: Un jugador se une a un juego.
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Jugador añadido al juego.
 */
router.post('/join', gameController.joinGame);

/**
 * @swagger
 * /api/game/action:
 *   post:
 *     summary: Maneja una acción de un jugador.
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Acción procesada exitosamente.
 */
router.post('/action', gameController.handlePlayerAction);

/**
 * @swagger
 * /api/game/end:
 *   post:
 *     summary: Finaliza un juego.
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Juego finalizado exitosamente.
 */
router.post('/end', gameController.endGame);

export default router;
