// server/src/routes/api/player.js
import express from 'express';
import playerController from '../../controllers/playerController.js';

const router = express.Router();

/**
 * @swagger
 * /player/create:
 *   post:
 *     summary: Crea un nuevo jugador
 *     tags: [Player]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Jugador creado exitosamente
 *       500:
 *         description: Error al crear el jugador
 */
router.post('/create', playerController.createPlayer);

/**
 * @swagger
 * /player/join:
 *   post:
 *     summary: Permite a un jugador unirse a un juego
 *     tags: [Player]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: string
 *               playerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Jugador unido al juego exitosamente
 *       400:
 *         description: Error en los datos
 */
router.post('/join', playerController.joinGame);

/**
 * @swagger
 * /player/leave:
 *   post:
 *     summary: Permite a un jugador salir de un juego
 *     tags: [Player]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: string
 *               playerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Jugador salió del juego exitosamente
 *       400:
 *         description: Error en los datos
 */
router.post('/leave', playerController.leaveGame);

/**
 * @swagger
 * /player/update-stats:
 *   post:
 *     summary: Actualiza las estadísticas del jugador
 *     tags: [Player]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: string
 *               playerId:
 *                 type: string
 *               stats:
 *                 type: object
 *     responses:
 *       200:
 *         description: Estadísticas actualizadas exitosamente
 *       400:
 *         description: Error en los datos
 */
router.post('/update-stats', playerController.updatePlayerStats);

export default router;
