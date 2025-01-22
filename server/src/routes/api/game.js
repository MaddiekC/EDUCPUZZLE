const express = require('express');
const router = express.Router();
const gameController = require('../../controllers/gameController');

// Rutas del controlador de juegos
router.post('/initialize', gameController.initializeGame);
router.post('/join', gameController.joinGame);
router.post('/action', gameController.handlePlayerAction);
router.post('/end', gameController.endGame);

module.exports = router;
