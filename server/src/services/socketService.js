// server/src/services/socketService.js
import { Server } from 'socket.io';
import gameService from './gameService.js'; // Asegúrate de que la ruta sea la correcta

class SocketService {
  constructor() {
    this.io = null; // Se inicializará con el servidor HTTP
    this.connections = new Map(); // Almacena información de los sockets conectados
  }

  /**
   * Inicializa el servidor de sockets con el servidor HTTP.
   * @param {http.Server} server 
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // Cambia esto en producción
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      console.log(`New connection: ${socket.id}`);
      this.setupListeners(socket);
    });
  }

  /**
   * Configura los listeners para cada socket.
   * Se incluyen eventos para:
   * - joinRoom: unirse a la sala (gameId)
   * - joinGame: para agregar al jugador al juego (además de joinRoom)
   * - playerMove: movimientos de jugador
   * - disconnect: para gestionar la desconexión
   * @param {SocketIO.Socket} socket 
   */
  setupListeners(socket) {
    // Permite que el cliente se una a la sala del juego
    socket.on('joinRoom', ({ gameId }) => {
      socket.join(gameId);
      console.log(`Socket ${socket.id} se unió a la sala ${gameId}`);

      // Si el juego existe, enviar el estado actual al socket que se acaba de unir.
      const game = gameService.games[gameId];
      if (game) {
        socket.emit('gameStateUpdated', game.getState());
      }
    });

    // Listener para que un jugador se una a un juego vía sockets
    socket.on('joinGame', async (data) => {
      const { username, gameId } = data;
      try {
        const player = await gameService.addPlayerToGame(gameId, username);
        // Guardamos la información de la conexión para luego poder desconectar
        this.connections.set(socket.id, { gameId, playerId: player._id ? player._id.toString() : player.id });
        // Unir el socket a la sala correspondiente (si no se ha hecho)
        socket.join(gameId);
        // Emitir el evento de que un jugador se unió, con la lista actualizada
        const players = await gameService.getPlayers(gameId);
        this.io.to(gameId).emit('playerJoined', { player, players });
        // Emitir el estado completo del juego a la sala
        const gameState = await gameService.getGameState(gameId);
        this.io.to(gameId).emit('gameStateUpdated', gameState);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Listener para movimientos de jugadores
    socket.on('playerMove', async (data) => {
      const { gameId, move } = data;
      try {
        const updatedGameState = await gameService.processPlayerMove(gameId, move);
        this.io.to(gameId).emit('gameStateUpdated', updatedGameState);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Listener para solicitar el estado actual del juego
    socket.on('getGameState', async ({ gameId }) => {
      const game = gameService.games[gameId];
      if (game) {
        socket.emit('gameStateUpdated', game.getState());
      }
    });

    // Listener para la desconexión
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

  /**
   * Emite un evento a todos los sockets de la sala (gameId).
   * @param {string} gameId 
   * @param {string} event 
   * @param {any} data 
   */
  broadcastUpdate(gameId, event, data) {
    if (this.io) {
      this.io.to(gameId).emit(event, data);
    }
  }
}

export default new SocketService();
