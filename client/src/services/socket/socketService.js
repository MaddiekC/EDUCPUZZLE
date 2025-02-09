// client/src/services/socket/socketService.js
import { io } from 'socket.io-client';

// Ajusta la URL a la de tu servidor (por ejemplo, 'http://localhost:4000')
const socket = io('http://192.168.100.13:3000');

const socketService = {
  /**
   * Permite suscribirse a las actualizaciones del juego.
   * Únicamente escucha el evento "gameStateUpdated".
   * También se encarga de unirse a la sala enviando "joinRoom".
   * @param {string} gameId 
   * @param {function} callback Callback que recibe el estado del juego.
   * @returns {function} Función de limpieza para remover el listener.
   */
  subscribeToGameUpdates: (gameId, callback, onError) => {
    // Unirse a la sala del juego
    socket.emit('joinRoom', { gameId });
    // Escuchar el evento de actualización del estado del juego
    const handler = (gameState) => {
      callback(gameState);
    };
    socket.on('gameStateUpdated', handler);
    // Escuchar errores (si el servidor emite errores)
    if (onError) {
      socket.on('error', onError);
    }
    // Función de limpieza para remover el listener
    return () => {
      socket.off('gameStateUpdated', handler);
    };
  },

  /**
   * Emite un evento con los datos proporcionados.
   * @param {string} event 
   * @param {any} data 
   */
  emit: (event, data) => {
    socket.emit(event, data);
  },

  socket,
};

export default socketService;
