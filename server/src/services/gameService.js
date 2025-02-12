// server/src/services/gameService.js
import games from "./gameStore.js"; // Importa el almacén de juegos
import Player from "../models/Player.js";

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

  // Aquí podrías incluir processPlayerMove, removePlayerFromGame, etc.
}

export default new GameService();
