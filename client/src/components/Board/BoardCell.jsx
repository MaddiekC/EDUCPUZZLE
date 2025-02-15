import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Trophy } from "lucide-react";
import PuzzleBoard from "../Puzzle/PuzzleBoard";
import useGameState from "../../hooks/useGameState";
import "./BoardCell.css";
import socket from '../../services/socket/socketService';

const BoardCell = () => {
  // ──────────────────────────────
  // Obtención de datos básicos
  // ──────────────────────────────
  const { gameId } = useParams();
  const localPlayerId = localStorage.getItem("userId");

  // ──────────────────────────────
  // Estado para mensajes emergentes y feedback
  // ──────────────────────────────
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showFeedback, setShowFeedback] = useState({
    show: false,
    isCorrect: false,
  });

  // ──────────────────────────────
  // Obtención de jugadores iniciales (desde el Lobby)
  // ──────────────────────────────
  const location = useLocation();
  const initialPlayersFromNav = location.state?.players || [];

  // ──────────────────────────────
  // Inicialización del estado del juego usando el nuevo hook
  // ──────────────────────────────
  const { gameState, updateGameState, isCurrentPlayerTurn } = useGameState(
    gameId,
    initialPlayersFromNav
  );

  const { equation, players, currentTurn, gameStats } = gameState;

  // ──────────────────────────────
  // Conexión al socket y depuración de estado
  // ──────────────────────────────
  
  useEffect(() => {
    if (socket) {
      console.log("Socket conectado:", socket.connected);  // Asegúrate de que la conexión esté activa
      
      const handleConnect = () => console.log("Conectado al servidor de sockets");
      const handleDisconnect = () => console.log("Desconectado del servidor de sockets");
      
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
  
      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
      };
    } else {
      console.log("Socket no está disponible");
    }
  }, []);
  
  // ──────────────────────────────
  // Limpieza de cache al iniciar un nuevo juego
  // ──────────────────────────────
  useEffect(() => {
    localStorage.removeItem("boardCellState");
  }, [gameId]);

  // ──────────────────────────────
  // Generación de la grilla numérica (1 a 9)
  // ──────────────────────────────
  const availableNumbers = Array.from({ length: 9 }, (_, i) => ({
    value: i + 1,
    isDisabled: false,
    isSelected: selectedNumber === i + 1,
  }));

  // ──────────────────────────────
  // Manejador de selección de número
  // ──────────────────────────────
  const handleNumberSelect = async (number) => {
    const currentPlayer = players[currentTurn];
    console.log("currentPlayer:", currentPlayer);

    // Priorizar el campo playerId del jugador, si existe; de lo contrario, usar _id o id
    const currentPlayerId =
      (currentPlayer.playerId || currentPlayer._id || currentPlayer.id)
        ?.toString()
        .trim() || "";
    // Usar el userId del localStorage para la comparación
    const localId = localPlayerId || "";
    console.log(
      "Comparando turno: currentPlayerId:",
      currentPlayerId,
      "localId:",
      localId
    );

    if (!isCurrentPlayerTurn(localPlayerId)) {
      setPopupMessage("No es tu turno");
      setTimeout(() => setPopupMessage(""), 5000);
      return;
    }
    console.log("Socket conectado:", socket.connected);
    socket.emit("playerMove", { gameId, playerId: localId, selectedNumber: number });
  };

  useEffect(() => {
    if (!socket) return;

    const handleBoardUpdate = (updatedGameState) => {
      // Validate incoming data
      if (!updatedGameState || typeof updatedGameState !== 'object') return;
      updateGameState(updatedGameState);

      if (typeof updatedGameState.lastMoveCorrect === "boolean") {
        setShowFeedback({
          show: true,
          isCorrect: updatedGameState.lastMoveCorrect,
        });

        // Use useRef for the timeout to prevent memory leaks
        const timeoutId = setTimeout(() => {
          setShowFeedback({ show: false, isCorrect: false });
        }, 1500);

        return () => clearTimeout(timeoutId);
      }
    };

    socket.on("boardUpdate", handleBoardUpdate);

    return () => {
      socket.off("boardUpdate", handleBoardUpdate);
    };
  }, [socket, updateGameState]); // Added socket dependency

  useEffect(() => {
    const handleError = (err) => {
      console.error("Error recibido del servidor:", err);
      setPopupMessage(err.message);
      setTimeout(() => setPopupMessage(""), 5000);
    };

    socket.on("error", handleError);
    return () => {
      socket.off("error", handleError);
    };
  }, []);

  // ──────────────────────────────
  // Renderizado de la interfaz
  // ──────────────────────────────
  return (
    <div className="board-wrapper">
      {popupMessage && <div className="popup-message">{popupMessage}</div>}
      <div className="game-info">
        {/* Sección de jugadores */}
        <div className="players-section">
          {players.map((player, index) => (
            <div
              key={player._id || player.id || index}
              className={`player-card ${currentTurn === index ? "active" : ""}`}
            >
              <h3 className="player-username">{player.username}</h3>
              <span className="player-score">{player.score}</span>
              <div className="player-stats">
                <small>Racha: {player.streak} 🔥</small>
              </div>
            </div>
          ))}
        </div>

        {/* Sección de ecuación */}
        <div className="equation-section">
          <div className="equation-display">
            <span>{equation.left}</span>
            <span>{equation.operator}</span>
            <span className="equation-unknown">{equation.right}</span>
            <span>=</span>
            <span>{equation.result}</span>
          </div>
        </div>

        {/* Mensaje de feedback */}
        {showFeedback.show && (
          <div
            className={`feedback-message ${showFeedback.isCorrect ? "correct" : "wrong"
              }`}
          >
            {showFeedback.isCorrect ? (
              <CheckCircle2 className="feedback-icon" />
            ) : (
              <AlertCircle className="feedback-icon" />
            )}
          </div>
        )}

        {/* Sección de números para jugar */}
        <div className="numbers-grid">
          {availableNumbers.map(({ value, isDisabled, isSelected }) => (
            <button
              key={value}
              className={`number-button ${isSelected ? "selected" : ""} ${showFeedback.show && isSelected
                  ? showFeedback.isCorrect
                    ? "correct-answer"
                    : "wrong-answer"
                  : ""
                }`}
              onClick={() => handleNumberSelect(value)}
              disabled={isDisabled || showFeedback.show}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Estadísticas del juego */}
        <div className="game-stats">
          <div className="stat-item">
            <Trophy className="stat-icon" />
            <span>Mejor racha: {gameStats.bestStreak}</span>
          </div>
        </div>
      </div>

      {/* Sección del Puzzle */}
      <div className="puzzle-wrapper">
        <h2>Puzzle</h2>
        <PuzzleBoard correctAnswersCount={gameStats.correctAnswers} />
      </div>
    </div>
  );
};

export default BoardCell;
