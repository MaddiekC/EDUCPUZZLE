// server/src/models/Game.js
import Player from './Player.js';
import Puzzle from './Puzzle.js';

class Game {
  constructor(gameId) {
    this.id = gameId;
    this.gameState = {
      status: 'waiting', // waiting, active, completed
      startTime: null,
      endTime: null,
    };
    this.players = new Map(); // playerId -> Player instance
    this.currentPuzzle = null; // Puzzle instance
  }

  // Inicializa el juego (por ejemplo, al iniciarlo)
  initialize(difficulty) {
    this.gameState.status = 'active';
    this.gameState.startTime = new Date();
    // Se crean piezas de puzzle con la estructura requerida
    const pieces = [
      { id: 'piece1', value: 1, position: { x: 0, y: 0 }, isPlaced: false },
      { id: 'piece2', value: 2, position: { x: 0, y: 0 }, isPlaced: false },
      { id: 'piece3', value: 3, position: { x: 0, y: 0 }, isPlaced: false },
    ];
    // Se crea una instancia de Puzzle utilizando el modelo Mongoose
    this.currentPuzzle = new Puzzle({
      id: `puzzle-${this.id}`,
      difficulty,
      equation: 'Solve this equation',
      solution: 42, // Puedes personalizarlo
      pieces,
    });
    // Se barajan las piezas
    this.currentPuzzle.shufflePieces();
  }

  joinGame(player) {
    // Prioriza player.playerId; si no existe, usa _id o player.id
    const playerId = player.playerId
      ? player.playerId.toString()
      : (player._id ? player._id.toString() : player.id);
    if (player instanceof Player && !this.players.has(playerId)) {
      this.players.set(playerId, player);
    }
  }

  // Elimina a un jugador
  leaveGame(playerId) {
    if (this.players.has(playerId)) {
      this.players.delete(playerId);
    }
  }

  // Actualiza el estado del juego (por ejemplo, cuando se completa el puzzle)
  updateGameState() {
    // Si se ha completado el puzzle (todas las piezas colocadas)
    if (this.currentPuzzle && this.currentPuzzle.checkProgress()) {
      this.gameState.status = 'completed';
      this.gameState.endTime = new Date();
    }
  }

  // Retorna el estado del juego a enviar al cliente
  getState() {
    return {
      id: this.id,
      gameState: this.gameState,
      players: Array.from(this.players.values()).map(player => ({
        id: player._id ? player._id.toString() : player.id,
        username: player.username,
        score: player.score,
        // Si el jugador tiene método getProgress, se usa; de lo contrario, se devuelve null
        progress: player.getProgress ? player.getProgress() : null,
      })),
      currentPuzzle: this.currentPuzzle ? this.currentPuzzle.getState() : null,
    };
  }

  resetGame() {
    this.gameState = {
      status: 'waiting',
      startTime: null,
      endTime: null,
    };
    this.currentPuzzle = null;
    this.players.forEach(player => {
      if (typeof player.resetScore === 'function') {
        player.resetScore();
      }
    });
  }
}

export default Game;
