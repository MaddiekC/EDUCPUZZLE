
// client/src/components/BoardCell.jsx
import React, { useState, useEffect, useCallback } from "react";
import PuzzleBoard from "../Puzzle/PuzzleBoard";
import { AlertCircle, CheckCircle2, Trophy } from "lucide-react";
import "./BoardCell.css";
import { useLocation } from 'react-router-dom';

const BoardCell = () => {
  // Estados principales
  const [equation, setEquation] = useState({
    left: 9,
    operator: "x",
    right: "?",
    result: 81,
  });
  // Extraer el estado enviado a través de la navegación
  const location = useLocation();
  const initialPlayers = location.state?.players || [];
  
  // Inicializar el estado con la lista de jugadores recibida
  const [players, setPlayers] = useState(initialPlayers);
  
  const [currentTurn, setCurrentTurn] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showFeedback, setShowFeedback] = useState({
    show: false,
    isCorrect: false,
  });
  const [gameStats, setGameStats] = useState({
    totalMoves: 0,
    correctAnswers: 0,
    bestStreak: 0,
  });

  // Generamos números del 1 al 9
  const availableNumbers = Array.from({ length: 9 }, (_, i) => ({
    value: i + 1,
    isDisabled: false,
    isSelected: selectedNumber === i + 1,
  }));

  // Generador de ecuaciones ajustado
  const generateNewEquation = useCallback(() => {
    const operators = ["x", "+", "-"];
    const randomOperator =
      operators[Math.floor(Math.random() * operators.length)];
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

    setEquation({
      left: newLeft,
      operator: randomOperator,
      right: "?",
      result,
    });
  }, []);

  // Validación de la respuesta
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

  // Manejo de la selección de número
  const handleNumberSelect = async (number) => {
    setSelectedNumber(number);
    const isCorrect = validateAnswer(number);
    setShowFeedback({ show: true, isCorrect });

    setGameStats((prev) => ({
      totalMoves: prev.totalMoves + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      bestStreak: Math.max(
        prev.bestStreak,
        isCorrect ? players[currentTurn].streak + 1 : 0
      ),
    }));

    if (isCorrect) {
      const updatedPlayers = players.map((player, index) =>
        index === currentTurn
          ? { ...player, score: player.score + 10, streak: player.streak + 1 }
          : player
      );
      setPlayers(updatedPlayers);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      generateNewEquation();
      setCurrentTurn((prevTurn) => (prevTurn + 1) % players.length);
    } else {
      const updatedPlayers = players.map((player, index) =>
        index === currentTurn ? { ...player, streak: 0 } : player
      );
      setPlayers(updatedPlayers);
    }

    setTimeout(() => {
      setShowFeedback({ show: false, isCorrect: false });
      setSelectedNumber(null);
    }, 1500);
  };

  useEffect(() => {
    generateNewEquation();
  }, [generateNewEquation]);

  // Efecto para el "hitbox magnético" usando solo el botón más cercano
  useEffect(() => {
    const grid = document.querySelector(".numbers-grid");
    if (!grid) return;
    const buttons = grid.querySelectorAll(".number-button");
    const threshold = 100; // rango de detección en píxeles

    const handleMouseMove = (e) => {
      let closestButton = null;
      let minDistance = Infinity;
      // Se calcula la distancia de cada botón al cursor
      buttons.forEach((button) => {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          minDistance = distance;
          closestButton = button;
        }
      });
      // Solo se escala el botón más cercano si está dentro del umbral
      buttons.forEach((button) => {
        if (button === closestButton && minDistance < threshold) {
          const scale = 1 + 0.3 * (1 - minDistance / threshold);
          button.style.transform = `scale(${scale})`;
        } else {
          button.style.transform = "";
        }
      });
    };

    const handleMouseLeave = () => {
      buttons.forEach((button) => {
        button.style.transform = "";
      });
    };

    grid.addEventListener("mousemove", handleMouseMove);
    grid.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      grid.removeEventListener("mousemove", handleMouseMove);
      grid.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="board-wrapper">
      {/* Izquierda: Información del juego */}
      <div className="game-info">
        <div className="players-section">
          {players.map((player, index) => (
            <div
              key={player.id|| index}
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

        <div className="equation-section">
          <div className="equation-display">
            <span>{equation.left}</span>
            <span>{equation.operator}</span>
            <span className="equation-unknown">{equation.right}</span>
            <span>=</span>
            <span>{equation.result}</span>
          </div>
        </div>

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

        <div className="game-stats">
          <div className="stat-item">
            <Trophy className="stat-icon" />
            <span>Mejor racha: {gameStats.bestStreak}</span>
          </div>
        </div>
      </div>

      {/* Derecha: Puzzle */}
      <div className="puzzle-wrapper">
        <h2>Puzzle</h2>
        <PuzzleBoard correctAnswersCount={gameStats.correctAnswers} />
      </div>
    </div>
  );
};

export default BoardCell;
