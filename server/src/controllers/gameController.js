const Game = require('../models/Game');
const Player = require('../models/Player');
const Puzzle = require('../models/Puzzle');
const socketService = require('../services/socketService');

class GameController {
  constructor() {
    this.games = {}; // Aquí mantenemos todos los juegos por su gameId
    this.socketManager = socketService;
  }

  // Inicia un nuevo juego
  async initializeGame(req, res) {
    try {
      const { gameId, playerId } = req.body;
      
      // Crea una nueva instancia de juego
      if (this.games[gameId]) {
        return res.status(400).json({ message: 'Game ID already exists' });
      }

      this.games[gameId] = new Game(gameId);
      const player = new Player(playerId);
      
      // Añade al jugador al juego
      this.games[gameId].joinGame(player);

      // Inicia el primer rompecabezas
      const puzzle = new Puzzle();
      this.games[gameId].currentPuzzle = puzzle;

      // Responde con el estado inicial del juego
      res.status(200).json({
        message: 'Game initialized successfully',
        gameState: this.games[gameId].getState(),
      });
    } catch (err) {
      res.status(500).json({ message: 'Error initializing game', error: err.message });
    }
  }

  // Permite a un jugador unirse al juego
  joinGame(req, res) {
    const { gameId, playerId } = req.body;

    if (!this.games[gameId]) {
      return res.status(400).json({ message: 'Game not found' });
    }

    const player = new Player(playerId);
    this.games[gameId].joinGame(player);

    // Actualiza el estado del juego y emite la actualización
    this.games[gameId].updateGameState();
    this.socketManager.broadcastUpdate(this.games[gameId]);

    res.status(200).json({
      message: 'Player joined successfully',
      gameState: this.games[gameId].getState(),
    });
  }

  // Maneja las acciones del jugador (como mover piezas)
  handlePlayerAction(req, res) {
    const { gameId, playerId, action } = req.body;

    if (!this.games[gameId]) {
      return res.status(400).json({ message: 'Game not found' });
    }

    const player = this.games[gameId].players.get(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Procesa la acción del jugador
    this.games[gameId].processGameLogic(player, action);

    // Actualiza el estado del juego y emite la actualización
    this.games[gameId].updateGameState();
    this.socketManager.broadcastUpdate(this.games[gameId]);

    res.status(200).json({
      message: 'Action processed successfully',
      gameState: this.games[gameId].getState(),
    });
  }

  // Termina el juego
  endGame(req, res) {
    const { gameId } = req.body;

    if (!this.games[gameId]) {
      return res.status(400).json({ message: 'Game not found' });
    }

    // Finaliza el juego
    this.games[gameId].endGame();
    
    // Emite la actualización del estado final del juego
    this.socketManager.broadcastUpdate(this.games[gameId]);

    res.status(200).json({
      message: 'Game ended successfully',
      gameState: this.games[gameId].getState(),
    });
  }
}

// Exportar la instancia
module.exports = new GameController();
