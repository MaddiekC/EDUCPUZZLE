// client/src/components/BoardCell.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PuzzleBoard from '../Puzzle/PuzzleBoard';
import { AlertCircle, CheckCircle2, Trophy } from 'lucide-react';
import './BoardCell.css';

const BoardCell = () => {
  // Estados principales
  const [equation, setEquation] = useState({
    left: 9,
    operator: 'x',
    right: '?',
    result: 81
  });
  
  const [players, setPlayers] = useState([
    { id: 1, name: 'Jhon', score: 0, streak: 0 },
    { id: 2, name: 'Samir', score: 0, streak: 0 }
  ]);
  
  const [currentTurn, setCurrentTurn] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showFeedback, setShowFeedback] = useState({ show: false, isCorrect: false });
  const [gameStats, setGameStats] = useState({
    totalMoves: 0,
    correctAnswers: 0,
    bestStreak: 0
  });

  // Números disponibles con metadata
  const availableNumbers = Array.from({ length: 9 }, (_, i) => ({
    value: i + 1,
    isDisabled: false,
    isSelected: selectedNumber === i + 1
  }));

  // Generador de ecuaciones mejorado
  const generateNewEquation = useCallback(() => {
    const operators = ['x', '+', '-'];
    const randomOperator = operators[Math.floor(Math.random() * operators.length)];
    let newLeft, newRight, result;

    do {
      newLeft = Math.floor(Math.random() * 9) + 1;
      newRight = Math.floor(Math.random() * 9) + 1;
      
      switch (randomOperator) {
        case 'x':
          result = newLeft * newRight;
          break;
        case '+':
          result = newLeft + newRight;
          break;
        case '-':
          // Aseguramos que el resultado sea positivo
          if (newLeft < newRight) [newLeft, newRight] = [newRight, newLeft];
          result = newLeft - newRight;
          break;
        default:
          result = newLeft * newRight;
      }
    } while (result > 81 || result < 1); // Mantenemos resultados manejables

    setEquation({
      left: newLeft,
      operator: randomOperator,
      right: '?',
      result: result
    });
  }, []);

  // Validación de respuestas mejorada
  const validateAnswer = useCallback((selected) => {
    let correctAnswer;
    
    switch (equation.operator) {
      case 'x':
        correctAnswer = equation.left * selected === equation.result;
        break;
      case '+':
        correctAnswer = equation.left + selected === equation.result;
        break;
      case '-':
        correctAnswer = equation.left - selected === equation.result;
        break;
      default:
        correctAnswer = false;
    }

    return correctAnswer;
  }, [equation]);

  // Manejo de selección de números
  const handleNumberSelect = async (number) => {
    setSelectedNumber(number);
    const isCorrect = validateAnswer(number);
    
    setShowFeedback({ show: true, isCorrect });
    
    // Actualizar estadísticas
    setGameStats(prev => ({
      totalMoves: prev.totalMoves + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      bestStreak: Math.max(prev.bestStreak, 
        isCorrect ? players[currentTurn].streak + 1 : 0)
    }));

    if (isCorrect) {
      // Actualizar jugador actual
      const updatedPlayers = players.map((player, index) => {
        if (index === currentTurn) {
          return {
            ...player,
            score: player.score + 10,
            streak: player.streak + 1
          };
        }
        return player;
      });
      
      setPlayers(updatedPlayers);
      
      // Esperar a que se muestre el feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar nueva ecuación y cambiar turno
      generateNewEquation();
      setCurrentTurn((prevTurn) => (prevTurn + 1) % players.length);
    } else {
      // Resetear streak del jugador actual
      const updatedPlayers = players.map((player, index) => {
        if (index === currentTurn) {
          return { ...player, streak: 0 };
        }
        return player;
      });
      setPlayers(updatedPlayers);
    }

    // Limpiar feedback después de un tiempo
    setTimeout(() => {
      setShowFeedback({ show: false, isCorrect: false });
      setSelectedNumber(null);
    }, 1500);
  };

  // Efecto inicial
  useEffect(() => {
    generateNewEquation();
  }, [generateNewEquation]);

  return (
    <div className="game-container">
      {/* Sección de jugadores */}
      <div className="players-section">
        {players.map((player, index) => (
          <div 
            key={player.id} 
            className={`player-card ${currentTurn === index ? 'active' : ''}`}
          >
            <h3 className="player-name">{player.name}</h3>
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

      {/* Feedback visual */}
      {showFeedback.show && (
        <div className={`feedback-message ${showFeedback.isCorrect ? 'correct' : 'wrong'}`}>
          {showFeedback.isCorrect ? (
            <CheckCircle2 className="feedback-icon" />
          ) : (
            <AlertCircle className="feedback-icon" />
          )}
        </div>
      )}

      {/* Grid de números */}
      <div className="numbers-grid">
        {availableNumbers.map(({ value, isDisabled, isSelected }) => (
          <button
            key={value}
            className={`number-button ${isSelected ? 'selected' : ''} 
                       ${showFeedback.show && isSelected ? 
                         (showFeedback.isCorrect ? 'correct-answer' : 'wrong-answer') : ''}`}
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

      {/* Tablero del puzzle */}
      <div className="puzzle-section">
        <h2>Puzzle</h2>
        <PuzzleBoard />
      </div>
    </div>
  );
};

export default BoardCell;