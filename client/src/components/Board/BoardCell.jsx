/* global localStorage */
import React, { useState, useEffect, useCallback, useRef } from "react";
import PuzzleBoard from "../Puzzle/PuzzleBoard";
import { AlertCircle, CheckCircle2, Trophy } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import socketService from "../../services/socket/socketService";
import "./BoardCell.css";

const BoardCell = () => {
  // Obtener el gameId desde la URL y el id del jugador local desde localStorage
  const { gameId } = useParams();
  const localPlayerId = localStorage.getItem("userId");
  console.log("Local player id:", localPlayerId);

  // Estado para mensajes emergentes
  const [popupMessage, setPopupMessage] = useState("");

  // Extraer jugadores iniciales enviados desde el Lobby
  const location = useLocation();
  const initialPlayersFromNav = location.state?.players || [];

  // Función para recuperar estado guardado (o devolver null)
  const getSavedState = () => {
    const saved = localStorage.getItem("boardCellState");
    return saved ? JSON.parse(saved) : null;
  };

  /**
   * Generador de ecuaciones modificado para retornar la nueva ecuación
   */
  const generateNewEquation = useCallback(() => {
    const operators = ["x", "+", "-"];
    const randomOperator = operators[Math.floor(Math.random() * operators.length)];
    let newLeft, newRight, result;
    do {
      newLeft = Math.floor(Math.random() * 9) + 1;
      newRight = Math.floor(Math.random() * 9) + 1;
      switch (randomOperator) {
        case "x":
          result = newLeft * newRight;
          break;
        case "+":
          result = newLeft + newRight;
          break;
        case "-":
          if (newLeft < newRight) [newLeft, newRight] = [newRight, newLeft];
          result = newLeft - newRight;
          break;
        default:
          result = newLeft * newRight;
      }
    } while (result > 81 || result < 1);
    return { left: newLeft, operator: randomOperator, right: "?", result };
  }, []);

  // Estados iniciales de la partida (se intenta cargar de localStorage o se usan valores por defecto)
  const [equation, setEquation] = useState(() => {
    const savedState = getSavedState();
    return (savedState && savedState.equation) || { left: 9, operator: "x", right: "?", result: 81 };
  });
  const [players, setPlayers] = useState(() => {
    const savedState = getSavedState();
    return (savedState && savedState.players) || initialPlayersFromNav;
  });
  const [currentTurn, setCurrentTurn] = useState(() => {
    const savedState = getSavedState();
    return savedState && typeof savedState.currentTurn === "number" ? savedState.currentTurn : 0;
  });
  const [gameStats, setGameStats] = useState(() => {
    const savedState = getSavedState();
    return (
      (savedState && savedState.gameStats) || {
        totalMoves: 0,
        correctAnswers: 0,
        bestStreak: 0,
      }
    );
  });

  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showFeedback, setShowFeedback] = useState({ show: false, isCorrect: false });

  // Lógica para el tiempo límite por turno
  const TIME_LIMIT = 10; // segundos
  const [turnTimer, setTurnTimer] = useState(TIME_LIMIT);
  const turnAnsweredRef = useRef(false);

  /**
   * --- SOCKETS PARA SINCRONIZAR LA PARTIDA ---
   *
   * Al montar el componente se emite el evento "joinGameBoard" para unirse a la sala del juego.
   * Se escucha el evento "boardUpdate:{gameId}" para actualizar el estado de la partida.
   */
  useEffect(() => {
    if (!gameId) return;
    socketService.emit("joinGameBoard", { gameId });
    const handleBoardUpdate = (data) => {
      if (data.gameId === gameId && data.boardState) {
        const { equation, players, currentTurn, gameStats } = data.boardState;
        setEquation(equation);
        setPlayers(players);
        setCurrentTurn(currentTurn);
        setGameStats(gameStats);
      }
    };
    socketService.on(`boardUpdate:${gameId}`, handleBoardUpdate);
    return () => {
      socketService.off(`boardUpdate:${gameId}`, handleBoardUpdate);
      socketService.emit("leaveGameBoard", { gameId });
    };
  }, [gameId]);

  // Mostrar en consola el turno actual (id y nombre)
  useEffect(() => {
    if (players.length > 0) {
      const currentPlayer = players[currentTurn];
      console.log(
        "Turno actual:",
        (currentPlayer.id || currentPlayer._id)?.toString().trim(),
        currentPlayer.username
      );
    }
  }, [currentTurn, players]);

  // Generamos la grilla de números (1 al 9)
  const availableNumbers = Array.from({ length: 9 }, (_, i) => ({
    value: i + 1,
    isDisabled: false,
    isSelected: selectedNumber === i + 1,
  }));

  // Función para validar la respuesta según el operador de la ecuación
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

  /**
   * Función para emitir el nuevo estado de la partida vía socket y guardarlo localmente.
   */
  const emitBoardUpdate = (boardState) => {
    socketService.emit("boardUpdate", { gameId, boardState });
    localStorage.setItem("boardCellState", JSON.stringify(boardState));
  };

  /**
   * Al agotarse el tiempo de turno se actualiza el estado (se suma un movimiento y se reinicia la racha)
   * y se pasa al siguiente jugador.
   */
  const handleTurnTimeout = () => {
    setPopupMessage("Tiempo agotado");
    const newGameStats = {
      ...gameStats,
      totalMoves: gameStats.totalMoves + 1,
    };
    const updatedPlayers = players.map((player, index) =>
      index === currentTurn ? { ...player, streak: 0 } : player
    );
    const newTurn = (currentTurn + 1) % players.length;
    const newEquation = generateNewEquation();
    const boardState = {
      equation: newEquation,
      players: updatedPlayers,
      currentTurn: newTurn,
      gameStats: newGameStats,
    };
    setTimeout(() => {
      setPopupMessage("");
      emitBoardUpdate(boardState);
    }, 1500);
  };

  /**
   * Manejo de la selección de número.
   * Primero se valida que sea el turno del jugador local comparando los IDs.
   * Si es su turno, se valida la respuesta, se actualizan estadísticas y se prepara el nuevo estado,
   * el cual se emite a través de socket para que ambos clientes se actualicen.
   */
  const handleNumberSelect = async (number) => {
    const currentPlayer = players[currentTurn];
    const currentPlayerId = (currentPlayer.id || currentPlayer._id)?.toString().trim();
    const localId = localPlayerId?.toString().trim();
    console.log("Comparando turno: currentPlayerId:", currentPlayerId, "localId:", localId);
    if (currentPlayerId !== localId) {
      setPopupMessage("No es tu turno");
      setTimeout(() => {
        setPopupMessage("");
      }, 5000);
      return;
    }
    // Marcar que ya se respondió en el turno para detener el timeout
    turnAnsweredRef.current = true;
    setSelectedNumber(number);
    const isCorrect = validateAnswer(number);
    setShowFeedback({ show: true, isCorrect });

    // Actualizar estadísticas y el estado del jugador actual
    const newGameStats = {
      ...gameStats,
      totalMoves: gameStats.totalMoves + 1,
      correctAnswers: gameStats.correctAnswers + (isCorrect ? 1 : 0),
      bestStreak: Math.max(gameStats.bestStreak, isCorrect ? (currentPlayer.streak || 0) + 1 : 0),
    };
    const updatedPlayers = players.map((player, index) => {
      if (index === currentTurn) {
        if (isCorrect) {
          return { ...player, score: (player.score || 0) + 10, streak: (player.streak || 0) + 1 };
        } else {
          return { ...player, streak: 0 };
        }
      }
      return player;
    });
    const newTurn = (currentTurn + 1) % players.length;
    const newEquation = generateNewEquation();
    const boardState = {
      equation: newEquation,
      players: updatedPlayers,
      currentTurn: newTurn,
      gameStats: newGameStats,
    };
    setTimeout(() => {
      setShowFeedback({ show: false, isCorrect: false });
      setSelectedNumber(null);
      emitBoardUpdate(boardState);
    }, 1500);
  };

  /**
   * Efecto para el contador de tiempo del turno.
   * Se reinicia en cada cambio de turno y, si se agota el tiempo sin respuesta, se llama a handleTurnTimeout.
   */
  useEffect(() => {
    setTurnTimer(TIME_LIMIT);
    turnAnsweredRef.current = false;
    const intervalId = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          if (!turnAnsweredRef.current) {
            handleTurnTimeout();
          }
          return TIME_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [currentTurn]);

  return (
    <div className="board-wrapper">
      {popupMessage && <div className="popup-message">{popupMessage}</div>}
      <div className="game-info">
        <div className="players-section">
          {players.map((player, index) => (
            <div key={player.id || player._id || index} className={`player-card ${currentTurn === index ? "active" : ""}`}>
              <h3 className="player-username">{player.username}</h3>
              <span className="player-score">{player.score}</span>
              <div className="player-stats">
                <small>Racha: {player.streak} 🔥</small>
              </div>
            </div>
          ))}
        </div>

        <div className="equation-section">
          <div className="equation-display">
            <span>{equation.left}</span>
            <span>{equation.operator}</span>
            <span className="equation-unknown">{equation.right}</span>
            <span>=</span>
            <span>{equation.result}</span>
          </div>
          <div className="turn-timer">
            Tiempo restante: {turnTimer} segundo{turnTimer !== 1 ? "s" : ""}
          </div>
        </div>

        {showFeedback.show && (
          <div className={`feedback-message ${showFeedback.isCorrect ? "correct" : "wrong"}`}>
            {showFeedback.isCorrect ? <CheckCircle2 className="feedback-icon" /> : <AlertCircle className="feedback-icon" />}
          </div>
        )}

        <div className="numbers-grid">
          {availableNumbers.map(({ value, isDisabled, isSelected }) => (
            <button
              key={value}
              className={`number-button ${isSelected ? "selected" : ""} ${
                showFeedback.show && isSelected ? (showFeedback.isCorrect ? "correct-answer" : "wrong-answer") : ""
              }`}
              onClick={() => handleNumberSelect(value)}
              disabled={isDisabled || showFeedback.show}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="game-stats">
          <div className="stat-item">
            <Trophy className="stat-icon" />
            <span>Mejor racha: {gameStats.bestStreak}</span>
          </div>
        </div>
      </div>

      <div className="puzzle-wrapper">
        <h2>Puzzle</h2>
        <PuzzleBoard correctAnswersCount={gameStats.correctAnswers} />
      </div>
    </div>
  );
};

export default BoardCell;
