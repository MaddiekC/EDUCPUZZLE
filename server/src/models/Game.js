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

  initialize(difficulty) {
    this.gameState.status = 'active';
    this.gameState.startTime = new Date();
    this.currentPuzzle = new Puzzle({
      id: `puzzle-${this.id}`,
      difficulty,
      equation: 'Solve this equation',
      solution: 42, // Puedes personalizar esto
      pieces: [], // Define las piezas como quieras
    });
    this.currentPuzzle.shufflePieces();
  }

  joinGame(player) {
    if (player instanceof Player && !this.players.has(player.id)) {
      this.players.set(player.id, player);
    }
  }

  leaveGame(playerId) {
    if (this.players.has(playerId)) {
      this.players.delete(playerId);
    }
  }

  updateGameState() {
    if (this.currentPuzzle && this.currentPuzzle.checkProgress()) {
      this.gameState.status = 'completed';
      this.gameState.endTime = new Date();
    }
  }

  getState() {
    return {
      id: this.id,
      gameState: this.gameState,
      players: Array.from(this.players.values()).map(player => player.getProgress()),
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
    this.players.forEach(player => player.resetScore());
  }
}

export default Game;
