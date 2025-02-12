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
   * Se incluyen eventos para:
   * - joinRoom: unirse a la sala (gameId)
   * - joinGame: para agregar al jugador al juego (además de joinRoom)
   * - playerMove: movimientos de jugador (verificando que sea el turno correcto)
   * - startGame: para iniciar el juego
   * - gameCountdown: para sincronizar la cuenta regresiva
   * - getGameState: para solicitar el estado actual
   * - disconnect: para gestionar la desconexión
   * @param {SocketIO.Socket} socket
   */
  setupListeners(socket) {
    // 1. joinRoom: Permite que el cliente se una a la sala del juego
    socket.on("joinRoom", ({ gameId }) => {
      socket.join(gameId);
      console.log(`Socket ${socket.id} se unió a la sala ${gameId}`);
      // Si el juego existe, enviamos el estado actual al socket recién unido.
      const game = gameService.games[gameId];
      if (game) {
        socket.emit("gameStateUpdated", game.getState());
      }
    });

    // 2. joinGame: Agrega al jugador al juego
    socket.on("joinGame", async (data) => {
      // Extraer username, gameId y userId
      const { username, gameId, userId } = data;
      try {
        // Pasa el userId a la función addPlayerToGame
        const player = await gameService.addPlayerToGame(gameId, username, userId);
        
        // Guardamos la información de la conexión para desconectar luego si es necesario
        this.connections.set(socket.id, {
          gameId,
          playerId: player._id ? player._id.toString() : player.id,
        });
        socket.join(gameId);
        
        // Emitir que un jugador se unió, con la lista actualizada
        const players = await gameService.getPlayers(gameId);
        this.io.to(gameId).emit("playerJoined", { player, players });
        
        // Emitir el estado completo del juego a la sala
        const gameState = await gameService.getGameState(gameId);
        this.io.to(gameId).emit("gameStateUpdated", gameState);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });
    

    // 3. playerMove: Procesa el movimiento del jugador que debe estar en su turno
    socket.on("playerMove", async (data) => {
      const { gameId, playerId, selectedNumber } = data;
      try {
        const game = gameService.games[gameId];
        if (!game) {
          return socket.emit("error", { message: "Game not found" });
        }
        // Convertimos el Map de jugadores a un array para determinar quién tiene el turno
        const playersArray = Array.from(game.players.values());
        if (playersArray.length === 0) {
          return socket.emit("error", { message: "No players in game" });
        }
        const currentPlayer = playersArray[game.currentTurn];
        if (currentPlayer.id !== playerId) {
          return socket.emit("error", { message: "Not your turn" });
        }
        // Procesamos el movimiento. La función processPlayerMove debe validar la respuesta,
        // actualizar puntajes, generar nueva ecuación, actualizar la racha, cambiar el turno, etc.
        const updatedGameState = await gameService.processPlayerMove(gameId, {
          playerId,
          selectedNumber,
        });
        // Emitir el estado actualizado a todos en la sala usando el evento 'boardUpdate'
        this.io.to(gameId).emit("boardUpdate", updatedGameState);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // 4. startGame: Inicia el juego
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
        this.io.to(gameId).emit("gameStarted", {
          gameId,
          players: Array.from(game.players.values()),
        });
        console.log(`Evento gameStarted emitido correctamente para gameId: ${gameId}`);
      } else {
        console.error(`Game with id ${gameId} not found`);
        socket.emit("error", { message: "Game not found" });
      }
    });

    // 5. gameCountdown: Sincroniza la cuenta regresiva entre clientes
    socket.on("gameCountdown", ({ gameId, countdown }) => {
      console.log(`gameCountdown event recibido de socket ${socket.id} para gameId: ${gameId} con countdown: ${countdown}`);
      // Reemitir el evento a todos en la sala
      this.io.to(gameId).emit("gameCountdown", { gameId, countdown });
    });

    // 6. getGameState: Envía el estado actual del juego al cliente que lo solicita
    socket.on("getGameState", async ({ gameId }) => {
      const game = gameService.games[gameId];
      if (game) {
        socket.emit("gameStateUpdated", game.getState());
      }
    });

    // 7. disconnect: Maneja la desconexión del socket y actualiza el juego
    socket.on("disconnect", () => {
      const connectionInfo = this.connections.get(socket.id);
      if (connectionInfo) {
        const { gameId, playerId } = connectionInfo;
        gameService.removePlayerFromGame(gameId, playerId);
        this.io.to(gameId).emit("playerLeft", { playerId });
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
