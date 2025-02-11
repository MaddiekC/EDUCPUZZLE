/* global localStorage */
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axios";
import socketService from "../../services/socket/socketService";
import "./Lobby.css";

// Componente para mostrar cada jugador en forma de carta.
const PlayerCard = ({ player }) => (
  <div className="player-card">
    <div className="card-background" />
    <div className="card-content">
      <h4 className="player-name">{player.username}</h4>
      <p className="player-status">Listo para el duelo</p>
    </div>
  </div>
);

PlayerCard.propTypes = {
  player: PropTypes.object.isRequired,
};

// Header del Lobby (muestra título e ID de partida).
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

// Mensaje de espera según la cantidad de jugadores conectados.
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

// Botón para iniciar el duelo.
const StartGameButton = ({ onStart, disabled, gameStarting }) => (
  <button className="start-game-button" onClick={onStart} disabled={disabled}>
    {gameStarting ? "Iniciando duelo..." : "Iniciar Duelo"}
  </button>
);

StartGameButton.propTypes = {
  onStart: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  gameStarting: PropTypes.bool,
};

// Componente para el chat (simulación).
const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
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

const Lobby = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waitingTime, setWaitingTime] = useState(0);
  const [gameStarting, setGameStarting] = useState(false);
  const [countdown, setCountdown] = useState(null); // Estado para la cuenta regresiva

  const isHost = localStorage.getItem("isHost") === "true";

  const fetchPlayers = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`/game/${gameId}/players`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        // Si la API indica que el juego ya inició, activa la redirección
        if (response.data.gameStarted) {
          console.log("El juego ya inició según la API. Redirigiendo...");
          setGameStarting(true);
        }
        if (response.data.players) {
          setPlayers(response.data.players);
        }
      }
    } catch (err) {
      console.error("Error al obtener jugadores:", err);
      setError("Error al obtener jugadores");
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Efecto para redirigir cuando el juego comienza.
  useEffect(() => {
    if (gameStarting) {
      const redirectTimeout = setTimeout(() => {
        console.log("Ejecutando redirección a /boardCell/" + gameId);
        navigate(`/boardCell/${gameId}`, {
          state: { players },
          replace: true
        });
      }, 1000);
      return () => clearTimeout(redirectTimeout);
    }
  }, [gameStarting, gameId, navigate, players]);

  // Efecto principal para la lógica del socket.
  useEffect(() => {
    let mounted = true;

    console.log(`Unido a la sala con gameId: ${gameId}`);
    socketService.emit("joinRoom", { gameId });

    fetchPlayers();

    const handleGameUpdate = (gameState) => {
      if (!mounted) return;
      console.log("Estado del juego actualizado:", gameState);
      if (gameState && Array.isArray(gameState.players)) {
        setPlayers(gameState.players);
      }
    };

    const handleGameStarted = (data) => {
      if (!mounted) return;
      console.log("Evento gameStarted recibido:", data);
      if (data.gameId === gameId) {
        console.log("Iniciando proceso de redirección...");
        setGameStarting(true);
      }
    };

    socketService.on(`gameState:${gameId}`, handleGameUpdate);
    socketService.on("gameStarted", handleGameStarted);

    socketService.emit("getGameState", { gameId });

    const timer = setInterval(() => {
      if (mounted) {
        setWaitingTime((prev) => prev + 1);
      }
    }, 1000);

    const pollInterval = setInterval(() => {
      if (mounted) {
        fetchPlayers();
      }
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(timer);
      clearInterval(pollInterval);
      socketService.off(`gameState:${gameId}`, handleGameUpdate);
      socketService.off("gameStarted", handleGameStarted);
      socketService.emit("leaveLobby", { gameId });
    };
  }, [gameId, fetchPlayers]);

  // Todos los clientes escuchan el evento "gameCountdown" para actualizar la cuenta regresiva.
  useEffect(() => {
    const handleGameCountdown = (data) => {
      if (data.gameId === gameId) {
        setCountdown(data.countdown);
      }
    };

    socketService.on("gameCountdown", handleGameCountdown);

    return () => {
      socketService.off("gameCountdown", handleGameCountdown);
    };
  }, [gameId]);

  // Función que, desde el host, inicia la cuenta regresiva y emite cada segundo el valor actualizado.
  const startCountdown = () => {
    let counter = 5;
    setCountdown(counter);
    // Emite inmediatamente el valor inicial.
    socketService.emit("gameCountdown", { gameId, countdown: counter });
    const countdownInterval = setInterval(() => {
      counter--;
      socketService.emit("gameCountdown", { gameId, countdown: counter });
      if (counter <= 0) {
        clearInterval(countdownInterval);
        setGameStarting(true);
        // El host emite el evento para iniciar el juego.
        socketService.emit("startGame", { gameId, players });
      }
    }, 1000);
  };

  // Función que se ejecuta al presionar "Iniciar Duelo" (solo para el host).
  const handleStartGame = () => {
    if (players.length < 2) return;
    console.log("El host inicia la cuenta regresiva para el duelo...");
    startCountdown();
  };

  const handleLeaveLobby = () => {
    socketService.emit("leaveLobby", { gameId });
    navigate("/menu", { replace: true });
  };

  return (
    <div className="lobby-container">
      <LobbyHeader gameId={gameId} />
      <div className="top-controls">
        <button 
          className="leave-lobby-button" 
          onClick={handleLeaveLobby}
          disabled={gameStarting}
        >
          Salir de la Sala
        </button>
      </div>
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
        {isHost ? (
          <>
            {players.length < 2 ? (
              <p className="lobby-status">
                Partida creada, esperando que jugadores se conecten...
              </p>
            ) : (
              countdown !== null ? (
                <p className="lobby-countdown">
                  El duelo inicia en: {countdown} segundo{countdown !== 1 ? "s" : ""}
                </p>
              ) : (
                <StartGameButton
                  onStart={handleStartGame}
                  disabled={players.length < 2 || countdown !== null}
                  gameStarting={gameStarting}
                />
              )
            )}
          </>
        ) : (
          <p className="lobby-status">
            {countdown !== null
              ? `El duelo inicia en: ${countdown} segundo${countdown !== 1 ? "s" : ""}`
              : gameStarting
              ? "Iniciando duelo..."
              : "Espera a que el host inicie la partida..."}
          </p>
        )}
      </div>
      <div className="chat-section">
        <ChatBox />
      </div>
    </div>
  );
};

export default Lobby;
