// server/src/services/gameService.js
import Game from '../models/Game.js';
import Player from '../models/Player.js';
import Puzzle from '../models/Puzzle.js';
import socketService from './socketService.js';

class GameService {
  constructor() {
    // Almacenamos los juegos en memoria (clave: gameId)
    this.games = {}; 
  }

  /**
   * Crea un nuevo juego.
   * @param {string} gameId - Identificador único para el juego.
   * @param {string} difficulty - Dificultad del juego.
   * @returns {Game} El juego recién creado.
   */
  async createGame(gameId, difficulty) {
    if (!gameId || gameId.trim() === '') {
      throw new Error("El campo 'gameId' es obligatorio");
    }
    if (this.games[gameId]) {
      throw new Error("El juego ya existe");
    }

    // Creamos una nueva instancia de Game (no es un modelo de Mongoose)
    const game = new Game(gameId);
    // Inicializamos el juego (esto crea y baraja el Puzzle)
    game.initialize(difficulty);

    // Guardamos el juego en memoria
    this.games[gameId] = game;

    return game;
  }

  /**
   * Agrega un jugador al juego.
   * Se crea el jugador en la BD (usando Mongoose) y se añade al juego en memoria.
   * @param {string} gameId - Identificador del juego.
   * @param {string} username - Nombre del jugador.
   * @returns {Player} El jugador agregado.
   */
  async addPlayerToGame(gameId, username) {
    if (!username || username.trim() === '') {
      throw new Error("El campo 'username' es obligatorio");
    }
    
    const game = this.games[gameId];
    if (!game) {
      throw new Error("Juego no encontrado");
    }

    // Creamos una nueva instancia de Player (modelo de Mongoose)
    const player = new Player({ username });
    await player.save();

    // Se añade al juego (el método joinGame se encarga de evitar duplicados)
    game.joinGame(player);

    // Emitir actualización vía sockets: se envía el estado completo del juego
    socketService.broadcastUpdate(gameId, "gameStateUpdated", game.getState());

    return player;
  }

  /**
   * Remueve a un jugador del juego.
   * @param {string} gameId - Identificador del juego.
   * @param {string} playerId - Identificador del jugador.
   */
  async removePlayerFromGame(gameId, playerId) {
    const game = this.games[gameId];
    if (!game) {
      throw new Error("Juego no encontrado");
    }

    game.leaveGame(playerId);

    socketService.broadcastUpdate(gameId, "playerLeft", { playerId });
  }

  /**
   * Inicia el juego: por ejemplo, asigna un puzzle.
   * @param {string} gameId - Identificador del juego.
   * @returns {Game} El juego actualizado.
   */
  async startGame(gameId) {
    const game = this.games[gameId];
    if (!game) {
      throw new Error("Juego no encontrado");
    }

    // Seleccionamos un puzzle de la base de datos (ejemplo: el primero que encuentre)
    const puzzle = await Puzzle.findOne();
    if (!puzzle) {
      throw new Error("Puzzle no encontrado");
    }

    game.currentPuzzle = puzzle;
    game.gameState.status = "active";

    socketService.broadcastUpdate(gameId, "gameStarted", game.getState());

    return game;
  }

  /**
   * Valida la solución enviada por un jugador.
   * Si es correcta, actualiza el puntaje del jugador.
   * @param {string} gameId - Identificador del juego.
   * @param {string} playerId - Identificador del jugador.
   * @param {any} solution - Solución enviada.
   * @returns {boolean} Indica si la solución es válida.
   */
  async validateSolution(gameId, playerId, solution) {
    const game = this.games[gameId];
    if (!game) {
      throw new Error("Juego no encontrado");
    }

    const puzzle = game.currentPuzzle;
    if (!puzzle) {
      throw new Error("Puzzle no encontrado");
    }

    const isValid = puzzle.validateSolution(solution);
    if (isValid) {
      const player = game.players.get(playerId);
      if (!player) {
        throw new Error("Jugador no encontrado en el juego");
      }
      await player.updateScore(10);
      socketService.broadcastUpdate(gameId, "solutionValid", player);
    } else {
      socketService.broadcastUpdate(gameId, "solutionInvalid", { playerId });
    }

    return isValid;
  }

  /**
   * Actualiza el estado del juego.
   * @param {string} gameId - Identificador del juego.
   * @param {object} newState - El nuevo estado del juego.
   * @returns {Game} El juego actualizado.
   */
  async updateGameState(gameId, newState) {
    const game = this.games[gameId];
    if (!game) {
      throw new Error("Juego no encontrado");
    }

    game.gameState = newState;
    socketService.broadcastUpdate(gameId, "gameStateUpdated", game.getState());

    return game;
  }

  /**
   * Obtiene el estado del juego.
   * @param {string} gameId - Identificador del juego.
   * @returns {object} El estado del juego.
   */
  async getGameState(gameId) {
    const game = this.games[gameId];
    if (!game) {
      throw new Error("Juego no encontrado");
    }
    return game.getState();
  }

  /**
   * Obtiene la lista de jugadores en el juego.
   * @param {string} gameId - Identificador del juego.
   * @returns {Array} Arreglo de jugadores.
   */
  async getPlayers(gameId) {
    const game = this.games[gameId];
    if (!game) {
      throw new Error("Juego no encontrado");
    }
    return Array.from(game.players.values());
  }
}

export default new GameService();
