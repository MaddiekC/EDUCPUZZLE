// services/socket/socketService.js
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = io('http://localhost:4000');
  }

  subscribeToGameUpdates(gameId, callback) {
    this.socket.on(`gameUpdate-${gameId}`, callback);
    return () => {
      this.socket.off(`gameUpdate-${gameId}`, callback);
    };
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }
}

const socketService = new SocketService();
export default socketService;