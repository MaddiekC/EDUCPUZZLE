/* global localStorage */
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Trophy } from "lucide-react";
import PuzzleBoard from "../Puzzle/PuzzleBoard";
import socketService from "../../services/socket/socketService";
import { generateNewEquation } from "../../services/game/equationGenerator";
import "./BoardCell.css";

const BoardCell = () => {
  // ──────────────────────────────
  // Obtención de datos básicos
  // ──────────────────────────────
  const { gameId } = useParams();
  const localPlayerId = localStorage.getItem("userId");
  const localUsername = localStorage.getItem("username")?.trim();
  console.log("Local player id:", localPlayerId);

  // ──────────────────────────────
  // Limpieza de cache al iniciar un nuevo juego
  // ──────────────────────────────
  useEffect(() => {
    localStorage.removeItem("boardCellState");
  }, [gameId]);

  // ──────────────────────────────
  // Estado para mensajes emergentes
  // ──────────────────────────────
  const [popupMessage, setPopupMessage] = useState("");

  // ──────────────────────────────
  // Obtención de jugadores iniciales (desde el Lobby)
  // ──────────────────────────────
  const location = useLocation();
  const initialPlayersFromNav = location.state?.players || [];

  // ──────────────────────────────
  // Función para recuperar el estado guardado en localStorage
  // Validando que corresponda al juego actual
  // ──────────────────────────────
  const getSavedState = () => {
    const saved = localStorage.getItem("boardCellState");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Si el estado guardado no pertenece al juego actual, se descarta
      if (parsed.gameId && parsed.gameId !== gameId) {
        return null;
      }
      return parsed;
    }
    return null;
  };

  // ──────────────────────────────
  // Estados iniciales del tablero
  // ──────────────────────────────
  const [equation, setEquation] = useState(() => {
    const savedState = getSavedState();
    return (
      savedState?.equation || {
        left: 9,
        operator: "x",
        right: "?",
        result: 81,
      }
    );
  });

  const [players, setPlayers] = useState(() => {
    const savedState = getSavedState();
    return savedState?.players || initialPlayersFromNav;
  });

  const [currentTurn, setCurrentTurn] = useState(() => {
    const savedState = getSavedState();
    return typeof savedState?.currentTurn === "number"
      ? savedState.currentTurn
      : 0;
  });

  const [gameStats, setGameStats] = useState(() => {
    const savedState = getSavedState();
    return (
      savedState?.gameStats || {
        totalMoves: 0,
        correctAnswers: 0,
        bestStreak: 0,
      }
    );
  });

  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showFeedback, setShowFeedback] = useState({
    show: false,
    isCorrect: false,
  });

  // ──────────────────────────────
  // Conexión Socket: unirse y escuchar actualizaciones del tablero
  // ──────────────────────────────
  useEffect(() => {
    if (!gameId) return;

    // Al unirse a un nuevo juego, se limpia la cache
    localStorage.removeItem("boardCellState");

    // En este caso usamos un evento llamado "joinGameBoard" (debes asegurarte
    // que en el servidor se esté usando la lógica correspondiente, o ajustar el nombre)
    socketService.emit("joinGameBoard", { gameId });

    // IMPORTANTE: Utilizamos el mismo nombre de evento ("boardUpdate")
    // que es el que el servidor emite para notificar los cambios.
    const handleBoardUpdate = (data) => {
      if (data.gameId === gameId && data.boardState) {
        const { equation, players, currentTurn, gameStats } = data.boardState;
        setEquation(equation);
        setPlayers(players);
        setCurrentTurn(currentTurn);
        setGameStats(gameStats);
      }
    };

    socketService.on("boardUpdate", handleBoardUpdate);

    return () => {
      socketService.off("boardUpdate", handleBoardUpdate);
      socketService.emit("leaveGameBoard", { gameId });
    };
  }, [gameId]);

  // ──────────────────────────────
  // Depuración: Mostrar en consola el turno actual
  // ──────────────────────────────
  useEffect(() => {
    if (players.length > 0) {
      const currentPlayer = players[currentTurn];
      console.log(
        "Turno actual:",
        // Se usa _id, ya que en el servidor se crea el jugador con _id: userId
        (currentPlayer._id || currentPlayer.id)?.toString().trim(),
        currentPlayer.username
      );
    }
  }, [currentTurn, players]);

  // ──────────────────────────────
  // Generación de la grilla numérica (1 a 9)
  // ──────────────────────────────
  const availableNumbers = Array.from({ length: 9 }, (_, i) => ({
    value: i + 1,
    isDisabled: false,
    isSelected: selectedNumber === i + 1,
  }));

  // ──────────────────────────────
  // Función de validación de respuesta
  // ──────────────────────────────
  const validateAnswer = useCallback(
    (selected) => {
      switch (equation.operator) {
        case "x":
          return equation.left * selected === equation.result;
        case "+":
          return equation.left + selected === equation.result;
        case "-":
          return equation.left - selected === equation.result;
        default:
          return false;
      }
    },
    [equation]
  );

  // ──────────────────────────────
  // Función para emitir y guardar el nuevo estado del tablero
  // ──────────────────────────────
  const emitBoardUpdate = (boardState) => {
    socketService.emit("boardUpdate", { gameId, boardState });
    localStorage.setItem("boardCellState", JSON.stringify(boardState));
  };

  // ──────────────────────────────
  // Manejador de selección de número (jugada del jugador)
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

    if (currentPlayerId !== localId) {
      setPopupMessage("No es tu turno");
      setTimeout(() => setPopupMessage(""), 5000);
      return;
    }

    setSelectedNumber(number);
    const isCorrect = validateAnswer(number);
    setShowFeedback({ show: true, isCorrect });

    // Actualización de estadísticas: total de movimientos, respuestas correctas y racha
    const newGameStats = {
      ...gameStats,
      totalMoves: gameStats.totalMoves + 1,
      correctAnswers: gameStats.correctAnswers + (isCorrect ? 1 : 0),
      bestStreak: Math.max(
        gameStats.bestStreak,
        isCorrect ? (currentPlayer.streak || 0) + 1 : 0
      ),
    };

    // Actualización del estado del jugador (puntuación y racha) según si respondió correctamente o no
    const updatedPlayers = players.map((player, index) => {
      if (index === currentTurn) {
        return isCorrect
          ? {
              ...player,
              score: (player.score || 0) + 10,
              streak: (player.streak || 0) + 1,
            }
          : { ...player, streak: 0 };
      }
      return player;
    });

    // Se calcula el nuevo turno y se genera una nueva ecuación
    const newTurn = (currentTurn + 1) % players.length;
    const newEquation = generateNewEquation();
    const boardState = {
      gameId,
      equation: newEquation,
      players: updatedPlayers,
      currentTurn: newTurn,
      gameStats: newGameStats,
    };

    // Se espera 1.5 segundos para mostrar el feedback, luego se actualiza el estado
    setTimeout(() => {
      setShowFeedback({ show: false, isCorrect: false });
      setSelectedNumber(null);
      // Se actualiza el estado local para reflejar la jugada de inmediato
      setEquation(newEquation);
      setPlayers(updatedPlayers);
      setCurrentTurn(newTurn);
      setGameStats(newGameStats);
      // Se emite el nuevo estado del tablero vía socket
      emitBoardUpdate(boardState);
    }, 1500);
  };

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

        {/* Mensaje de feedback (correcto/incorrecto) */}
        {showFeedback.show && (
          <div
            className={`feedback-message ${
              showFeedback.isCorrect ? "correct" : "wrong"
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
              className={`number-button ${isSelected ? "selected" : ""} ${
                showFeedback.show && isSelected
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
