/* global localStorage */
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "../../api/axios";
import socketService from "../../services/socket/socketService";
import "./Lobby.css"; // Se importa el CSS correspondiente

/**
 * PlayerCard
 * Muestra la información del jugador con un estilo tipo "carta" para el lobby.
 */
const PlayerCard = ({ player }) => {
  return (
    <div className="player-card">
      <div className="card-background" />
      <div className="card-content">
        <h4 className="player-name">{player.username}</h4>
        <p className="player-status">Listo para el duelo</p>
      </div>
    </div>
  );
};

PlayerCard.propTypes = {
  player: PropTypes.object.isRequired,
};

/**
 * LobbyHeader
 * Muestra el título y el ID de la partida.
 */
const LobbyHeader = ({ gameId }) => (
  <div className="lobby-header">
    <h1 className="lobby-title">Sala de Duelo</h1>
    <p className="game-id">
      ID de la partida: <span>{gameId}</span>
    </p>
  </div>
);

LobbyHeader.propTypes = {
  gameId: PropTypes.string.isRequired,
};

/**
 * WaitingMessage
 * Muestra un mensaje de espera dependiendo de la cantidad de jugadores conectados.
 */
const WaitingMessage = ({ playersCount }) => (
  <div className="waiting-message">
    {playersCount === 0 ? (
      <p>Esperando a que se conecten los duelistas...</p>
    ) : (
      <p>
        {playersCount} duelista{playersCount > 1 ? "s" : ""} conectado
        {playersCount > 1 ? "s" : ""}
      </p>
    )}
  </div>
);

WaitingMessage.propTypes = {
  playersCount: PropTypes.number.isRequired,
};

/**
 * StartGameButton
 * Botón para iniciar el duelo. Se desactiva hasta que haya al menos 2 jugadores.
 */
const StartGameButton = ({ onStart, disabled }) => (
  <button className="start-game-button" onClick={onStart} disabled={disabled}>
    {disabled ? "Esperando más duelistas..." : "Iniciar Duelo"}
  </button>
);

StartGameButton.propTypes = {
  onStart: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

/**
 * ChatBox
 * Sección de chat para el lobby (simulación, se puede ampliar para comunicación en tiempo real).
 */
const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    // Se simula el envío del mensaje (en un caso real se emitiría vía socket)
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), text: inputMsg },
    ]);
    setInputMsg("");
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h4>Chat de Duelo</h4>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="no-messages">No hay mensajes aún.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="chat-message">
              {msg.text}
            </div>
          ))
        )}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe tu mensaje..."
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
        />
        <button className="chat-send-button" onClick={handleSendMessage}>
          Enviar
        </button>
      </div>
    </div>
  );
};

/**
 * Lobby
 * Componente principal del lobby que integra las secciones: header, listado de jugadores,
 * temporizador, botón de inicio y chat.
 */
const Lobby = ({ gameId }) => {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waitingTime, setWaitingTime] = useState(0);

  /**
   * fetchPlayers
   * Función que obtiene la lista de jugadores vía HTTP.
   */
  const fetchPlayers = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`/game/${gameId}/players`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.players) {
        setPlayers(response.data.players);
      }
    } catch (err) {
      console.error("Error al obtener jugadores:", err);
      setError("Error al obtener jugadores");
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    // Obtener jugadores al montar el componente
    fetchPlayers();

    // Suscribirse a las actualizaciones del juego vía socket
    const unsubscribe = socketService.subscribeToGameUpdates(
      gameId,
      (gameState) => {
        console.log("Recibido gameStateUpdated:", gameState);
        if (gameState && Array.isArray(gameState.players)) {
          setPlayers(gameState.players);
        }
      },
      (err) => {
        console.error("Error en la suscripción al socket:", err);
        setError("Error al actualizar el estado del juego");
      }
    );

    // Emitir solicitud de estado vía socket
    socketService.emit("getGameState", { gameId });

    // Temporizador para mostrar el tiempo de espera en el lobby
    const timer = setInterval(() => {
      setWaitingTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [gameId, fetchPlayers]);

  /**
   * handleStartGame
   * Lógica para iniciar el juego. Se activa solo si hay al menos dos jugadores.
   */
  const handleStartGame = () => {
    // Aquí se implementaría la lógica para iniciar el juego, por ejemplo,
    // emitiendo un evento vía socket o navegando a la vista del juego.
    console.log("Iniciando duelo con jugadores:", players);
  };

  return (
    <div className="lobby-container">
      <LobbyHeader gameId={gameId} />
      {error && <div className="error-message">{error}</div>}
      <WaitingMessage playersCount={players.length} />
      <div className="waiting-timer">
        Tiempo de espera: {waitingTime} segundo{waitingTime !== 1 ? "s" : ""}
      </div>
      <div className="players-section">
        {loading ? (
          <div className="loading-spinner">Cargando jugadores...</div>
        ) : players.length === 0 ? (
          <div className="no-players">Aún no hay duelistas conectados.</div>
        ) : (
          <div className="players-grid">
            {players.map((player) => (
              <PlayerCard key={player.id || player._id} player={player} />
            ))}
          </div>
        )}
      </div>
      <div className="controls-section">
        <StartGameButton
          onStart={handleStartGame}
          disabled={players.length < 2}
        />
      </div>
      <div className="chat-section">
        <ChatBox />
      </div>
    </div>
  );
};

Lobby.propTypes = {
  gameId: PropTypes.string.isRequired,
};

export default Lobby;
