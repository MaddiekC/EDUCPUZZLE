import { io } from "socket.io-client";

// Ajusta la URL a la de tu servidor
const socket = io("http://192.168.100.13:3000");
socket.on("connect", () => {
  console.log("Socket conectado en socketService.js:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket desconectado en socketService.js");
});
// Almacena los handlers activos para limpieza
const activeHandlers = new Map();

const socketService = {
  /**
   * Permite suscribirse a las actualizaciones del juego.
   * Se une a la sala correspondiente y escucha el evento "gameStateUpdated".
   */
  subscribeToGameUpdates: (gameId, callback, onError) => {
    socket.emit("joinRoom", { gameId });
    const handler = (gameState) => {
      callback(gameState);
    };
    socket.on("gameStateUpdated", handler);
    activeHandlers.set("gameStateUpdated", handler);

    if (onError) {
      socket.on("error", onError);
      activeHandlers.set("error", onError);
    }

    return () => {
      socket.off("gameStateUpdated", handler);
      if (onError) socket.off("error", onError);
      activeHandlers.delete("gameStateUpdated");
      activeHandlers.delete("error");
    };
  },

  /**
   * Se une específicamente a la sala del tablero de juego
   */
  joinGameBoard: (gameId) => {
    socket.emit("joinGameBoard", { gameId });
    // Solicitar el estado actual del juego al unirse
    socket.emit("getGameState", { gameId });
  },

  /**
   * Sale de la sala del tablero de juego
   */
  leaveGameBoard: (gameId) => {
    socket.emit("leaveGameBoard", { gameId });
  },

  /**
   * Emite una actualización del estado del tablero
   */
  emitBoardUpdate: (gameId, boardState) => {
    socket.emit("boardUpdate", {
      gameId,
      boardState: {
        ...boardState,
        timestamp: Date.now()
      }
    });
  },

  /**
   * Emite un evento con los datos proporcionados.
   */
  emit: (event, data) => {
    socket.emit(event, data);
    console.log(`Emitiendo evento ${event}:`, data);
  },

  /**
   * Permite suscribirse a eventos personalizados con manejo de limpieza.
   */
  subscribe: (event, callback) => {
    socket.on(event, callback);
    activeHandlers.set(event, callback);
    
    return () => {
      socket.off(event, callback);
      activeHandlers.delete(event);
    };
  },

  /**
   * Suscribe a un evento con logging
   */
  on: (event, callback) => {
    const wrappedCallback = (...args) => {
      console.log(`Recibido evento ${event}:`, ...args);
      callback(...args);
    };
    socket.on(event, wrappedCallback);
    activeHandlers.set(event, wrappedCallback);
  },

  /**
   * Remueve la suscripción a un evento
   */
  off: (event, callback) => {
    socket.off(event, callback);
    activeHandlers.delete(event);
  },

  /**
   * Limpia todos los handlers activos
   */
  cleanupAll: () => {
    activeHandlers.forEach((handler, event) => {
      socket.off(event, handler);
    });
    activeHandlers.clear();
  },

  /**
   * Reconecta el socket si se pierde la conexión
   */
  reconnect: () => {
    if (!socket.connected) {
      socket.connect();
    }
  },

  // Se expone el objeto socket y el estado de los handlers
  socket,
  getActiveHandlers: () => Array.from(activeHandlers.keys())
};

// Manejo de reconexión automática
socket.on('disconnect', () => {
  console.log('Socket desconectado. Intentando reconectar...');
  setTimeout(() => socketService.reconnect(), 1000);
});

export default socketService;