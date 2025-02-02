import React, { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';

const JoinRoom = () => {
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  const { socket } = useSocket();  // Usando el hook de socket

  const handleJoinGame = () => {
    if (username && gameId) {
      // Emitir evento para unirse al juego
      socket.emit('joinGame', { username, gameId }, (response) => {
        if (response.success) {
          //alert('Te has unido al juego');
        } else {
          //alert('Error al unirse al juego');
        }
      });
    } else {
      //alert('Por favor ingresa tu nombre y ID del juego');
    }
  };

  return (
    <div>
      <h1>Unirse a una Sala</h1>
      <input
        type="text"
        placeholder="Ingresa tu nombre"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Ingresa ID del juego"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
      />
      <button onClick={handleJoinGame}>Unirse al Juego</button>
    </div>
  );
};

export default JoinRoom;
