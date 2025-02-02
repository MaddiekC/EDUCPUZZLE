import React, { useEffect, useState } from "react";
import socketService from "../../services/socket/socketService";
import PropTypes from "prop-types";

const Lobby = ({ gameId }) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const unsubscribe = socketService.subscribeToGameUpdates(
      gameId,
      (gameState) => {
        setPlayers(gameState.players);
      }
    );

    socketService.emit("getGameState", { gameId });

    return () => unsubscribe();
  }, [gameId]);
  return (
    <div>
      <h2>Sala de Espera</h2>
      <p>ID de la partida: {gameId}</p>
      <h3>Jugadores conectados:</h3>
      <ul>
        {players.map((player) => (
          <li key={player.id}>{player.username}</li>
        ))}
      </ul>
      {/* Opcional: un botón para iniciar el juego cuando se tenga el mínimo de jugadores */}
    </div>
  );
};

// Validación de props
Lobby.propTypes = {
  gameId: PropTypes.string.isRequired, // o PropTypes.number dependiendo del tipo de 'gameId'
};

export default Lobby;
