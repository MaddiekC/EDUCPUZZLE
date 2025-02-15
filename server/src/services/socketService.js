// server/src/services/socketService.js
import { Server } from "socket.io";
import gameService from "./gameService.js"; // Asegúrate de que la ruta sea la correcta

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
        origin: "*", // Cambia esto en producción
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`New connection: ${socket.id}`);
      this.setupListeners(socket);
    });
  }

  /**
   * Configura los listeners para cada socket.
   * @param {SocketIO.Socket} socket
   */
  setupListeners(socket) {
    const io = this.io; // Capturamos la instancia de io

    // Evento para que el cliente se una a la sala del juego
    socket.on("joinRoom", ({ gameId }) => {
      socket.join(gameId);
      console.log(`Socket ${socket.id} se unió a la sala ${gameId}`);
      const game = gameService.games[gameId];
      if (game) {
        socket.emit("gameStateUpdated", game.getState());
      }
    });

    // Evento para que el cliente se una a la sala del tablero
    socket.on("joinGameBoard", ({ gameId }) => {
      socket.join(gameId);
      console.log(`Socket ${socket.id} se unió a la sala de board ${gameId}`);
    });

    // Evento para agregar al jugador al juego
    socket.on("joinGame", async (data) => {
      const { username, gameId, userId } = data;
      try {
        const player = await gameService.addPlayerToGame(gameId, username, userId);
        this.connections.set(socket.id, {
          gameId,
          playerId: player._id ? player._id.toString() : player.id,
        });
        socket.join(gameId);
        const players = await gameService.getPlayers(gameId);
        io.to(gameId).emit("playerJoined", { player, players });
        const gameState = await gameService.getGameState(gameId);
        io.to(gameId).emit("gameStateUpdated", gameState);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Evento para procesar el movimiento del jugador
    socket.on("playerMove", async (data) => {
      console.log("Evento playerMove recibido:", data);
      const { gameId, playerId, selectedNumber } = data;
      try {
        const game = gameService.games[gameId];
        if (!game) {
          return socket.emit("error", { message: "Game not found" });
        }
        
        // Procesa el movimiento en el servidor
        const updatedGameState = await gameService.processPlayerMove(gameId, {
          playerId,
          selectedNumber,
        });
        
        // Emite el estado actualizado a todos en la sala
        io.to(gameId).emit("boardUpdate", updatedGameState);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });
    


    // Evento para iniciar el juego
    socket.on("startGame", async ({ gameId }) => {
      console.log(`startGame event received from socket ${socket.id} for gameId: ${gameId}`);
      const game = gameService.games[gameId];
      if (game) {
        if (typeof game.startGame === "function") {
          game.startGame();
          console.log(`Juego ${gameId} marcado como iniciado.`);
        }
        game.updateGameState();
        console.log(`Emitiendo evento gameStarted a todos en la sala ${gameId}`);
        io.to(gameId).emit("gameStarted", {
          gameId,
          players: Array.from(game.players.values()),
        });
        console.log(`Evento gameStarted emitido correctamente para gameId: ${gameId}`);
      } else {
        console.error(`Game with id ${gameId} not found`);
        socket.emit("error", { message: "Game not found" });
      }
    });

    // Evento para sincronizar la cuenta regresiva entre clientes
    socket.on("gameCountdown", ({ gameId, countdown }) => {
      console.log(`gameCountdown event recibido de socket ${socket.id} para gameId: ${gameId} con countdown: ${countdown}`);
      io.to(gameId).emit("gameCountdown", { gameId, countdown });
    });

    // Evento para enviar el estado actual del juego al cliente que lo solicita
    socket.on("getGameState", async ({ gameId }) => {
      const game = gameService.games[gameId];
      if (game) {
        socket.emit("gameStateUpdated", game.getState());
      }
    });

    // Evento para manejar la desconexión del socket
    socket.on("disconnect", () => {
      const connectionInfo = this.connections.get(socket.id);
      if (connectionInfo) {
        const { gameId, playerId } = connectionInfo;
        gameService.removePlayerFromGame(gameId, playerId);
        io.to(gameId).emit("playerLeft", { playerId });
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
