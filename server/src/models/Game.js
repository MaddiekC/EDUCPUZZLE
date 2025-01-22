import Player from './Player';  // Asegúrate de que 'Player' se utiliza
import Puzzle from './Puzzle';  // Asegúrate de que la ruta sea correcta

class Game {
  constructor() {
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
    this.currentPuzzle = new Puzzle(difficulty);
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
    if (this.currentPuzzle && this.currentPuzzle.validateSolution()) {
      this.gameState.status = 'completed';
      this.gameState.endTime = new Date();
      this.broadcastState();
    }
  }

  broadcastState() {
    // Placeholder for broadcasting state to players (por ejemplo, vía WebSocket)
    console.log('Broadcasting game state:', {
      gameState: this.gameState,
      players: Array.from(this.players.values()).map(player => player.getProgress()),
    });
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
