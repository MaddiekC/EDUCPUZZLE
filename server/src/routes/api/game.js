// server/src/routes/api/game.js
import express from "express";
import GameController from "../../controllers/gameController.js";
const router = express.Router();

// Definir las rutas usando el controlador importado
router.get("/:gameId/players", (req, res) => GameController.getPlayers(req, res));
router.post("/initialize", (req, res) => GameController.initializeGame(req, res));
router.post("/join", (req, res) => GameController.joinGame(req, res));
router.post("/action", (req, res) => GameController.handlePlayerAction(req, res));
router.post("/end", (req, res) => GameController.endGame(req, res));

export default router;