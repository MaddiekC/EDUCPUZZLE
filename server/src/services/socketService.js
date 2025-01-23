import { Server } from 'socket.io';
import gameService from './gameService.js'

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // Configura esto con la URL de tu cliente para producción
        methods: ['GET', 'POST'],
      },
    });
    this.connections = new Map(); // Almacena usuarios conectados
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`New connection: ${socket.id}`);
      this.setupListeners(socket);
    });
  }

  setupListeners(socket) {
    // Listener para unir a un jugador al juego
    socket.on('joinGame', async (data) => {
      const { username, gameId } = data;

      try {
        const player = await gameService.addPlayerToGame(gameId, username);
        this.connections.set(socket.id, { gameId, playerId: player.id });
        socket.join(gameId);

        this.io.to(gameId).emit('playerJoined', {
          player,
          players: gameService.getPlayersInGame(gameId),
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Listener para enviar movimientos
    socket.on('playerMove', (data) => {
      const { gameId, move } = data;
      try {
        const updatedGameState = gameService.processPlayerMove(gameId, move);
        this.io.to(gameId).emit('gameStateUpdated', updatedGameState);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Listener para desconexión
    socket.on('disconnect', () => {
      const connectionInfo = this.connections.get(socket.id);
      if (connectionInfo) {
        const { gameId, playerId } = connectionInfo;
        gameService.removePlayerFromGame(gameId, playerId);
        this.io.to(gameId).emit('playerLeft', { playerId });

        this.connections.delete(socket.id);
        console.log(`Connection closed: ${socket.id}`);
      }
    });
  }

  broadcastUpdate(gameId, event, data) {
    this.io.to(gameId).emit(event, data);
  }
}

export default SocketService;
