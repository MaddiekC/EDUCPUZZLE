// server/src/services/gameService.js
import games from "./gameStore.js"; // Importa el almacén de juegos
import Player from "../models/Player.js";
import { validateAnswer, generateNewEquation } from "../utils/gameUtils.js";

class GameService {
  constructor() {
    // Usa el objeto de juegos importado, ya que es el mismo para todos los módulos
    this.games = games;
  }
  
  /**
   * Agrega un jugador al juego usando el userId proporcionado.
   * Si el jugador ya existe en el juego (según ese ID), lo retorna.
   * @param {string} gameId 
   * @param {string} username 
   * @param {string} userId  -> El id correcto enviado desde el cliente
   * @returns {Player} El jugador creado o existente.
   */
  async addPlayerToGame(gameId, username, userId) {
    const game = this.games[gameId];
    if (!game) {
      throw new Error("Game not found");
    }

    // Si el jugador no existe en el juego, lo agrega
    if (!game.players.has(userId)) {
      // Aquí usamos el userId que viene del cliente
      const player = new Player({ _id: userId, username});
      game.joinGame(player);
      game.updateGameState();
      return player;
    } else {
      // Si ya existe, retornarlo
      return game.players.get(userId);
    }
  }

  async getPlayers(gameId) {
    const game = this.games[gameId];
    if (!game) throw new Error("Game not found");
    return Array.from(game.players.values());
  }

  async getGameState(gameId) {
    const game = this.games[gameId];
    if (!game) throw new Error("Game not found");
    return game.getState();
  }


async processPlayerMove(gameId, { playerId, selectedNumber }) {
  console.log(`Procesando movimiento para gameId: ${gameId}, playerId: ${playerId}, selectedNumber: ${selectedNumber}`);
  const game = this.games[gameId];
  if (!game) throw new Error("Game not found");

  const playersArray = Array.from(game.players.values());
  const currentPlayer = playersArray[game.currentTurn];

  const currentPlayerId = (currentPlayer.playerId || currentPlayer._id || currentPlayer.id)?.toString() || '';
  console.log(`Turno actual de: ${currentPlayerId}, Jugador que intenta mover: ${playerId}`);
  if (currentPlayerId !== playerId) {
    throw new Error("Not your turn");
  }

  // Valida la respuesta y actualiza el juego...
  const isCorrect = validateAnswer(selectedNumber, game.equation);
  game.lastMoveCorrect = isCorrect;
  game.gameStats.totalMoves += 1;
  game.gameStats.correctAnswers += isCorrect ? 1 : 0;
  currentPlayer.streak = isCorrect ? (currentPlayer.streak || 0) + 1 : 0;
  if (isCorrect) {
    currentPlayer.score = (currentPlayer.score || 0) + 10;
  }
  
  game.equation = generateNewEquation();
  game.currentTurn = (game.currentTurn + 1) % playersArray.length;
  
  return game.getState();
}

}

export default new GameService();
