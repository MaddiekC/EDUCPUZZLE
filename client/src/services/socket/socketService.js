// socketService.js
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const socketService = {
  subscribeToGameUpdates: (gameId, callback) => {
    socket.on(`gameUpdate-${gameId}`, callback);
    return () => {
      socket.off(`gameUpdate-${gameId}`, callback);
    };
  },

  emit: (event, data) => {
    socket.emit(event, data);
  },

  socket
};

export default socketService;