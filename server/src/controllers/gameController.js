import Game from '../models/Game.js';
import Player from '../models/Player.js';
import Puzzle from '../models/Puzzle.js';
import socketService from '../services/socketService.js';

class GameController {
  constructor() {
    this.games = {};
    this.socketManager = socketService;

    // Vinculación explícita (opcional)
    this.initializeGame = this.initializeGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.handlePlayerAction = this.handlePlayerAction.bind(this);
    this.endGame = this.endGame.bind(this);
  }

  // Inicia un nuevo juego
  async initializeGame(req, res) {
    try {
      const { gameId, playerId, username, difficulty = 'easy' } = req.body;

      if (this.games[gameId]) {
        return res.status(400).json({ message: 'Game ID already exists' });
      }

      // Crea un nuevo juego
      const game = new Game(gameId);
      const player = new Player({ username, playerId });

      game.joinGame(player);

      // Crea e inicializa el rompecabezas
      const puzzle = new Puzzle({
        id: `puzzle-${gameId}`,
        difficulty,
        equation: 'Solve this equation',
        solution: 42,
        pieces: this.generatePuzzlePieces(),
      });
      puzzle.shufflePieces();
      game.currentPuzzle = puzzle;

      this.games[gameId] = game;

      res.status(200).json({
        message: 'Game initialized successfully',
        gameState: game.getState(),
      });
    } catch (err) {
      res.status(500).json({ message: 'Error initializing game', error: err.message });
    }
  }

  // Genera piezas para el rompecabezas
  generatePuzzlePieces() {
    // Ejemplo de piezas generadas
    return [
      { id: '1', value: '2', position: { x: 0, y: 0 }, isPlaced: false },
      { id: '2', value: '4', position: { x: 1, y: 0 }, isPlaced: false },
      // Más piezas según sea necesario...
    ];
  }

  // Permite a un jugador unirse al juego
  joinGame(req, res) {
    try {
      const { gameId, playerId, username } = req.body;

      if (!this.games[gameId]) {
        return res.status(400).json({ message: 'Game not found' });
      }

      const player = new Player({ username, playerId });
      this.games[gameId].joinGame(player);

      this.games[gameId].updateGameState();
      this.socketManager.broadcastUpdate(this.games[gameId]);

      res.status(200).json({
        message: 'Player joined successfully',
        gameState: this.games[gameId].getState(),
      });
    } catch (err) {
      res.status(500).json({ message: 'Error joining game', error: err.message });
    }
  }

  // Maneja acciones del jugador
  handlePlayerAction(req, res) {
    try {
      const { gameId, playerId, action } = req.body;

      if (!this.games[gameId]) {
        return res.status(400).json({ message: 'Game not found' });
      }

      const player = this.games[gameId].players.get(playerId);
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }

      this.games[gameId].processGameLogic(player, action);
      this.games[gameId].updateGameState();
      this.socketManager.broadcastUpdate(this.games[gameId]);

      res.status(200).json({
        message: 'Action processed successfully',
        gameState: this.games[gameId].getState(),
      });
    } catch (err) {
      res.status(500).json({ message: 'Error processing action', error: err.message });
    }
  }

  // Termina el juego
  endGame(req, res) {
    try {
      const { gameId } = req.body;

      if (!this.games[gameId]) {
        return res.status(400).json({ message: 'Game not found' });
      }

      this.games[gameId].endGame();
      this.socketManager.broadcastUpdate(this.games[gameId]);

      res.status(200).json({
        message: 'Game ended successfully',
        gameState: this.games[gameId].getState(),
      });
    } catch (err) {
      res.status(500).json({ message: 'Error ending game', error: err.message });
    }
  }
}

export default new GameController();
