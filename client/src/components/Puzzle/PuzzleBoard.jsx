// client/src/components/Puzzle/PuzzleBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Shuffle, RotateCcw, Crown } from 'lucide-react';
import PuzzlePiece from './PuzzlePiece';
import './Puzzle.css';

const PuzzleBoard = () => {
  const [pieces, setPieces] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [bestTime, setBestTime] = useState(localStorage.getItem('puzzleBestTime') || null);

  // Inicializar el tablero
  const initializeBoard = useCallback(() => {
    const numbers = Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      correctPosition: i + 1,
      currentPosition: i + 1,
      value: i + 1,
      image: null,
      isCorrect: true
    }));
    
    // Mezclar las piezas
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i].currentPosition, numbers[j].currentPosition] = 
      [numbers[j].currentPosition, numbers[i].currentPosition];
    }

    const isSolvable = checkIfSolvable(numbers);
    if (!isSolvable) {
      // Hacer el puzzle solvable intercambiando dos piezas
      [numbers[0].currentPosition, numbers[1].currentPosition] = 
      [numbers[1].currentPosition, numbers[0].currentPosition];
    }

    setPieces(numbers);
    setStartTime(Date.now());
    setMoves(0);
    setIsComplete(false);
  }, []);

  // Verificar si el puzzle tiene solución
  const checkIfSolvable = (numbers) => {
    let inversions = 0;
    for (let i = 0; i < numbers.length - 1; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        if (numbers[i].currentPosition > numbers[j].currentPosition) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  // Manejar el inicio del arrastre
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id.toString());
    e.target.classList.add('dragging');
  };

  // Manejar el soltar una pieza
  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
    const targetIdNum = parseInt(targetId);
    
    if (draggedId === targetIdNum) return;

    setPieces(prevPieces => {
      const newPieces = [...prevPieces];
      const draggedPiece = newPieces.find(p => p.id === draggedId);
      const targetPiece = newPieces.find(p => p.id === targetIdNum);
      
      // Intercambiar posiciones
      [draggedPiece.currentPosition, targetPiece.currentPosition] = 
      [targetPiece.currentPosition, draggedPiece.currentPosition];

      // Verificar si las piezas están en su posición correcta
      newPieces.forEach(piece => {
        piece.isCorrect = piece.currentPosition === piece.correctPosition;
      });

      return newPieces;
    });

    setMoves(prev => prev + 1);
    
    // Verificar si el puzzle está completo
    checkCompletion();
  }, []);

  // Verificar si el puzzle está completo
  const checkCompletion = useCallback(() => {
    const isCompleted = pieces.every(piece => piece.currentPosition === piece.correctPosition);
    
    if (isCompleted && !isComplete) {
      setIsComplete(true);
      const completionTime = Date.now() - startTime;
      
      if (!bestTime || completionTime < parseInt(bestTime)) {
        setBestTime(completionTime.toString());
        localStorage.setItem('puzzleBestTime', completionTime.toString());
      }
    }
  }, [pieces, isComplete, startTime, bestTime]);

  // Actualizar el tiempo
  useEffect(() => {
    if (!isComplete && startTime) {
      const timer = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [startTime, isComplete]);

  // Inicializar el juego
  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Formatear tiempo para mostrar
  const formatTime = (ms) => {
    if (!ms) return '00:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="puzzle-container">
      <div className="puzzle-header">
        <div className="puzzle-stats">
          <div className="stat-item">
            <span>Movimientos: {moves}</span>
          </div>
          <div className="stat-item">
            <span>Tiempo: {formatTime(currentTime)}</span>
          </div>
          {bestTime && (
            <div className="stat-item best-time">
              <Crown size={16} />
              <span>Mejor: {formatTime(parseInt(bestTime))}</span>
            </div>
          )}
        </div>
        <div className="puzzle-controls">
          <button 
            className="control-button"
            onClick={initializeBoard}
            title="Mezclar piezas"
          >
            <Shuffle size={20} />
          </button>
          <button 
            className="control-button"
            onClick={() => {
              setPieces(prev => prev.map(p => ({ ...p, currentPosition: p.correctPosition, isCorrect: true })));
              setIsComplete(true);
            }}
            title="Reiniciar puzzle"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className={`puzzle-board ${isComplete ? 'completed' : ''}`}>
        {pieces.sort((a, b) => a.currentPosition - b.currentPosition).map((piece) => (
          <PuzzlePiece
            key={piece.id}
            {...piece}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {isComplete && (
        <div className="completion-message">
          ¡Puzzle completado! 🎉
          <div className="completion-stats">
            <span>Tiempo: {formatTime(currentTime)}</span>
            <span>Movimientos: {moves}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuzzleBoard;