// server/src/controllers/playerController.js
import Player from '../models/Player';
import Game from '../models/Game';
import socketService from '../services/socketService';

class PlayerController {
  constructor() {
    this.socketManager = socketService;
  }

  // Crea un nuevo jugador
  createPlayer(req, res) {
    const { playerId } = req.body;
    try {
      const player = new Player(playerId);
      res.status(200).json({
        message: 'Player created successfully',
        playerId: player.id,
      });
    } catch (err) {
      res.status(500).json({ message: 'Error creating player', error: err.message });
    }
  }

  // Permite a un jugador unirse a un juego
  joinGame(req, res) {
    const { gameId, playerId } = req.body;

    // Verifica que el juego exista
    const game = Game.getGameById(gameId);
    if (!game) {
      return res.status(400).json({ message: 'Game not found' });
    }

    const player = new Player(playerId);

    // Verifica que el jugador no esté ya en el juego
    if (game.players.some(p => p.id === playerId)) {
      return res.status(400).json({ message: 'Player already in game' });
    }

    game.addPlayer(player);
    game.updateGameState();

    // Emite la actualización de estado
    this.socketManager.broadcastUpdate(game);

    res.status(200).json({
      message: 'Player joined successfully',
      gameState: game.getState(),
    });
  }

  // Permite a un jugador salir de un juego
  leaveGame(req, res) {
    const { gameId, playerId } = req.body;

    // Verifica que el juego exista
    const game = Game.getGameById(gameId);
    if (!game) {
      return res.status(400).json({ message: 'Game not found' });
    }

    const player = game.getPlayerById(playerId);
    if (!player) {
      return res.status(400).json({ message: 'Player not in game' });
    }

    game.removePlayer(player);

    // Actualiza el estado del juego y emite la actualización
    game.updateGameState();
    this.socketManager.broadcastUpdate(game);

    res.status(200).json({
      message: 'Player left the game',
      gameState: game.getState(),
    });
  }

  // Actualiza las estadísticas del jugador (por ejemplo, puntaje)
  updatePlayerStats(req, res) {
    const { gameId, playerId, stats } = req.body;

    // Verifica que el juego exista
    const game = Game.getGameById(gameId);
    if (!game) {
      return res.status(400).json({ message: 'Game not found' });
    }

    const player = game.getPlayerById(playerId);
    if (!player) {
      return res.status(400).json({ message: 'Player not in game' });
    }

    // Actualiza las estadísticas del jugador
    player.updateStats(stats);

    // Actualiza el estado del juego y emite la actualización
    game.updateGameState();
    this.socketManager.broadcastUpdate(game);

    res.status(200).json({
      message: 'Player stats updated successfully',
      gameState: game.getState(),
    });
  }
}

export default new PlayerController();
