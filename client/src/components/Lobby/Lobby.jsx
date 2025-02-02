import React, { useEffect, useState } from "react";
import socketService from "../../services/socket/socketService";
import PropTypes from "prop-types";

const Lobby = ({ gameId }) => {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = socketService.subscribeToGameUpdates(
      gameId,
      (gameState) => {
        setPlayers(gameState.players || []);
      },
      (err) => {
        setError("Error al obtener jugadores o actualizar el estado del juego");
        console.error(err);
      }
    );

    socketService.emit("getGameState", { gameId });

    return () => unsubscribe();
  }, [gameId]);

  return (
    <div>
      <h2>Sala de Espera</h2>
      <p>ID de la partida: {gameId}</p>

      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Mostrar mensaje de error */}

      <h3>Jugadores conectados:</h3>
      {players.length === 0 ? (
        <p>No hay jugadores conectados aún.</p>
      ) : (
        <ul>
          {players.map((player) => (
            <li key={player.id}>{player.username}</li>
          ))}
        </ul>
      )}

      {/* Opcional: un botón para iniciar el juego */}
      {players.length > 1 && (
        <button onClick={() => {/* lógica para iniciar el juego */}}>Iniciar Juego</button>
      )}
    </div>
  );
};

// Validación de props
Lobby.propTypes = {
  gameId: PropTypes.string.isRequired, // o PropTypes.number dependiendo del tipo de 'gameId'
};

export default Lobby;
