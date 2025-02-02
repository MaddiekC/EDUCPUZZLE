import React, { useState } from 'react';
import { useSocket } from '../../hooks/useSocket';


const CreateRoom = () => {
  const [username, setUsername] = useState('');
  const { socket } = useSocket();  // Usando el hook de socket
  const [gameId, setGameId] = useState(null);

  const handleCreateGame = () => {
    if (username) {
      // Emitir evento para crear el juego
      socket.emit('createGame', { username }, (response) => {
        if (response.success) {
          setGameId(response.gameId);  // Guarda el ID del juego creado
        } else {
          //alert('Error al crear el juego');
        }
      });
    } else {
      //alert('Por favor ingresa tu nombre');
    }
  };

  return (
    <div>
      <h1>Crear Sala</h1>
      <input
        type="text"
        placeholder="Ingresa tu nombre"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleCreateGame}>Crear Sala</button>
      {gameId && <p>Juego creado con ID: {gameId}</p>}
    </div>
  );
};

export default CreateRoom;
