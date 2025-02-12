// client/src/services/socket/socketService.js
import { io } from "socket.io-client";

// Ajusta la URL a la de tu servidor
const socket = io("http://192.168.100.13:3000");

const socketService = {
  /**
   * Permite suscribirse a las actualizaciones del juego.
   * Se une a la sala correspondiente y escucha el evento "gameStateUpdated".
   *
   * @param {string} gameId - El ID de la partida.
   * @param {function} callback - Función a ejecutar cuando se reciba un estado de juego.
   * @param {function} [onError] - Función a ejecutar si ocurre un error.
   * @returns {function} Función para remover el listener.
   */
  subscribeToGameUpdates: (gameId, callback, onError) => {
    socket.emit("joinRoom", { gameId });
    const handler = (gameState) => {
      callback(gameState);
    };
    socket.on("gameStateUpdated", handler);

    let errorHandler;
    if (onError) {
      errorHandler = onError;
      socket.on("error", errorHandler);
    }

    return () => {
      socket.off("gameStateUpdated", handler);
      if (errorHandler) {
        socket.off("error", errorHandler);
      }
    };
  },

  /**
   * Emite un evento con los datos proporcionados.
   *
   * @param {string} event - El nombre del evento.
   * @param {any} data - Los datos a enviar.
   */
  emit: (event, data) => {
    socket.emit(event, data);
  },

  /**
   * Permite suscribirse a eventos personalizados.
   *
   * @param {string} event - El nombre del evento.
   * @param {function} callback - Función a ejecutar cuando se reciba el evento.
   * @returns {function} Función para remover el listener del evento.
   */
  subscribe: (event, callback) => {
    socket.on(event, callback);
    return () => {
      socket.off(event, callback);
    };
  },

  /**
   * Permite suscribirse a un evento personalizado.
   *
   * @param {string} event - El nombre del evento.
   * @param {function} callback - Función a ejecutar cuando se reciba el evento.
   */
  on: (event, callback) => {
    socket.on(event, callback);
  },

  /**
   * Remueve la suscripción a un evento personalizado.
   *
   * @param {string} event - El nombre del evento.
   * @param {function} callback - Función que se usó para suscribirse.
   */
  off: (event, callback) => {
    socket.off(event, callback);
  },

  // Se expone el objeto socket para usos avanzados.
  socket,
};

export default socketService;
