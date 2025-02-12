// server/src/controllers/gameController.js
import Game from "../models/Game.js";
import Player from "../models/Player.js";
import Puzzle from "../models/Puzzle.js";
import socketService from "../services/socketService.js";
import games from "../services/gameStore.js";  // Importa el almacén de juegos

class GameController {
  constructor() {
    // En lugar de this.games = {}, usamos el objeto importado
    this.games = games;
    this.socketManager = socketService;

    // Vinculación de métodos si es necesario
    this.initializeGame = this.initializeGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.getPlayers = this.getPlayers.bind(this);
    this.handlePlayerAction = this.handlePlayerAction.bind(this);
    this.endGame = this.endGame.bind(this);
  }

  /**
   * Obtiene la lista de jugadores para un juego dado.
   * Ruta: GET /api/game/:gameId/players
   */
  async getPlayers(req, res) {
    try {
      const { gameId } = req.params;
      console.log(`Fetching players for game: ${gameId}`);
      
      const game = this.games[gameId];
      if (!game) {
        return res.status(404).json({ 
          message: "Game not found",
          gameId: gameId
        });
      }

      const players = Array.from(game.players.values());
      console.log(`Found ${players.length} players in game ${gameId}`);

      return res.status(200).json({
        message: "Players retrieved successfully",
        players: players
      });
    } catch (err) {
      console.error("Error in getPlayers:", err);
      return res.status(500).json({ 
        message: "Error fetching players", 
        error: err.message 
      });
    }
  }

  /**
   * Inicializa un nuevo juego o une al jugador al juego ya existente.
   * Ruta: POST /api/game/initialize
   *
   * Ejemplo de body:
   * {
   *   "gameId": "game-000166",
   *   "playerId": "679fcc1297eaa87ede3cd395",
   *   "username": "testuser",
   *   "difficulty": "easy"
   * }
   *
   * Si el juego ya existe, se intenta agregar al jugador (en caso de que no esté ya agregado)
   * y se devuelve el estado actual del juego.
   */
  async initializeGame(req, res) {
    try {
      const { gameId, playerId, username, difficulty = "easy" } = req.body;
      console.log(`Initializing game: ${gameId}`);

      // Si el juego ya existe, en lugar de dar error se une el jugador (si aún no está)
      if (this.games[gameId]) {
        const game = this.games[gameId];
        if (!game.players.has(playerId)) {
          const newPlayer = new Player({ username, playerId });
          game.joinGame(newPlayer);
          game.updateGameState();
          console.log(`Player ${username} joined existing game ${gameId}`);
          this.socketManager.broadcastUpdate(gameId, 'gameStateUpdated', game.getState());
        }
        return res.status(200).json({
          message: "Game already exists, player joined if not already present",
          gameState: game.getState()
        });
      }

      // Crea un nuevo juego y agrega el primer jugador
      const game = new Game(gameId);
      const player = new Player({ username, playerId });
      game.joinGame(player);

      // Crea e inicializa el rompecabezas
      const puzzle = new Puzzle({
        id: `puzzle-${gameId}`,
        difficulty,
        equation: "Solve this equation",
        solution: 42,
        pieces: this.generatePuzzlePieces(),
      });
      puzzle.shufflePieces();
      game.currentPuzzle = puzzle;

      this.games[gameId] = game;
      console.log(`Game ${gameId} initialized with first player: ${username}`);

      // Emite la actualización vía socket
      this.socketManager.broadcastUpdate(gameId, 'gameStateUpdated', game.getState());

      return res.status(200).json({
        message: "Game initialized successfully",
        gameState: game.getState()
      });
    } catch (err) {
      console.error("Error in initializeGame:", err);
      return res.status(500).json({ 
        message: "Error initializing game", 
        error: err.message 
      });
    }
  }

  /**
   * Permite a un jugador unirse a un juego existente.
   * Ruta: POST /api/game/join
   *
   * Ejemplo de body:
   * {
   *   "gameId": "game-000166",
   *   "playerId": "anotherPlayerId",
   *   "username": "anotherUser"
   * }
   */
  async joinGame(req, res) {
    try {
      const { gameId, playerId, username } = req.body;
      console.log(`Player ${username} attempting to join game: ${gameId}`);

      const game = this.games[gameId];
      if (!game) {
        return res.status(404).json({ 
          message: "Game not found",
          gameId: gameId
        });
      }

      // Verifica si el jugador ya está en el juego
      if (!game.players.has(playerId)) {
        const player = new Player({ username, playerId });
        game.joinGame(player);
        game.updateGameState();
        console.log(`Player ${username} joined game ${gameId} successfully`);
        this.socketManager.broadcastUpdate(gameId, 'gameStateUpdated', game.getState());
      }

      return res.status(200).json({
        message: "Player joined successfully",
        gameState: game.getState()
      });
    } catch (err) {
      console.error("Error in joinGame:", err);
      return res.status(500).json({ 
        message: "Error joining game", 
        error: err.message 
      });
    }
  }

  /**
   * Maneja las acciones enviadas por un jugador.
   * Ruta: POST /api/game/action
   *
   * Ejemplo de body:
   * {
   *   "gameId": "game-000166",
   *   "playerId": "playerId",
   *   "action": { ... }
   * }
   */
  handlePlayerAction(req, res) {
    try {
      const { gameId, playerId, action } = req.body;
      console.log(`Processing action for player ${playerId} in game ${gameId}`);

      const game = this.games[gameId];
      if (!game) {
        return res.status(400).json({ message: 'Game not found' });
      }

      const player = game.players.get(playerId);
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }

      game.processGameLogic(player, action);
      game.updateGameState();

      this.socketManager.broadcastUpdate(gameId, 'gameStateUpdated', game.getState());

      return res.status(200).json({
        message: 'Action processed successfully',
        gameState: game.getState()
      });
    } catch (err) {
      console.error("Error in handlePlayerAction:", err);
      return res.status(500).json({ message: 'Error processing action', error: err.message });
    }
  }

  /**
   * Finaliza el juego indicado.
   * Ruta: POST /api/game/end
   *
   * Ejemplo de body:
   * {
   *   "gameId": "game-000166"
   * }
   */
  endGame(req, res) {
    try {
      const { gameId } = req.body;
      console.log(`Ending game: ${gameId}`);

      const game = this.games[gameId];
      if (!game) {
        return res.status(400).json({ message: 'Game not found' });
      }

      game.endGame();
      this.socketManager.broadcastUpdate(gameId, 'gameStateUpdated', game.getState());

      return res.status(200).json({
        message: 'Game ended successfully',
        gameState: game.getState()
      });
    } catch (err) {
      console.error("Error in endGame:", err);
      return res.status(500).json({ message: 'Error ending game', error: err.message });
    }
  }

  /**
   * Genera las piezas del rompecabezas.
   */
  generatePuzzlePieces() {
    return [
      { id: "1", value: "2", position: { x: 0, y: 0 }, isPlaced: false },
      { id: "2", value: "4", position: { x: 1, y: 0 }, isPlaced: false },
    ];
  }
}

export default new GameController();
