/* eslint-env browser */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Package, Shuffle, RotateCcw, Crown } from 'lucide-react';
import PuzzlePiece from './PuzzlePiece';
import './Puzzle.css';

const PuzzleBoard = ({ correctAnswersCount }) => {
  // Obtención del mejor tiempo desde localStorage (si está disponible)
  const getBestTime = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('puzzleBestTime') || null;
    }
    return null;
  };

  // Estados:
  // - unlockedPieces: piezas disponibles en el inventario.
  // - placedPieces: arreglo de 9 elementos para el tablero (cada celda inicia en null).
  // - moves, startTime, currentTime, bestTime e isComplete: para la partida.
  const [unlockedPieces, setUnlockedPieces] = useState([]);
  const [placedPieces, setPlacedPieces] = useState(Array(9).fill(null));
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(0);
  const [bestTime, setBestTime] = useState(getBestTime());
  const [isComplete, setIsComplete] = useState(false);

  // Actualiza el tiempo cada segundo mientras el juego esté activo.
  useEffect(() => {
    if (!isComplete && startTime) {
      const timer = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, isComplete]);

  // Reinicia el tablero: celdas vacías y reinicia contadores.
  const initializeBoard = () => {
    setPlacedPieces(Array(9).fill(null));
    setMoves(0);
    setIsComplete(false);
    setStartTime(Date.now());
  };

  // Efecto para desbloquear piezas basado en correctAnswersCount.
  // Se activa solo cuando correctAnswersCount cambia, no cuando cambia placedPieces.
  useEffect(() => {
    if (correctAnswersCount < 2) return; // No se desbloquea nada si no hay al menos 2 respuestas.
    const piezasNecesarias = 1 + Math.floor((correctAnswersCount - 2) / 3);
    if (unlockedPieces.length < piezasNecesarias) {
      const availableNumbers = Array.from({ length: 9 }, (_, i) => i + 1).filter(num => {
        return !unlockedPieces.includes(num) && !placedPieces.includes(num);
      });
      const piezasAAgregar = availableNumbers
        .sort(() => Math.random() - 0.5)
        .slice(0, piezasNecesarias - unlockedPieces.length);
      setUnlockedPieces(prev => [...prev, ...piezasAAgregar]);
    }
  }, [correctAnswersCount]); // Solo depende de correctAnswersCount

  // --- DRAG & DROP DESDE INVENTARIO ---
  const handleDragStartFromInventory = (e, piece) => {
    e.dataTransfer.setData("text/plain", piece.toString());
  };

  // --- DRAG & DROP DESDE CELDA (para reubicar pieza) ---
  const handleDragStartFromCell = (e, index) => {
    const piece = placedPieces[index];
    if (!piece) return;
    e.dataTransfer.setData("text/plain", piece.toString());
    // Removemos la pieza de la celda para poder reubicarla.
    const newBoard = [...placedPieces];
    newBoard[index] = null;
    setPlacedPieces(newBoard);
    // Agregamos la pieza de vuelta al inventario.
    setUnlockedPieces(prev => [...prev, piece]);
  };

  // Permite que la celda acepte el drop.
  const handleCellDragOver = (e) => {
    e.preventDefault();
  };

  // Al soltar una pieza en una celda del tablero:
  const handleCellDrop = (e, index) => {
    e.preventDefault();
    const pieceStr = e.dataTransfer.getData("text/plain");
    const piece = parseInt(pieceStr, 10);
    if (piece && !placedPieces[index]) {
      const newBoard = [...placedPieces];
      newBoard[index] = piece;
      setPlacedPieces(newBoard);
      // Remover la pieza del inventario.
      setUnlockedPieces(prev => prev.filter(p => p !== piece));
      setMoves(prev => prev + 1);
      checkCompletion(newBoard);
    }
  };

  // Permite retirar una pieza del tablero (por ejemplo, clic derecho) para devolverla al inventario.
  const handleRemovePiece = (index) => {
    const pieza = placedPieces[index];
    if (pieza) {
      const newBoard = [...placedPieces];
      newBoard[index] = null;
      setPlacedPieces(newBoard);
      setUnlockedPieces(prev => [...prev, pieza]);
    }
  };

  // Verifica si el tablero está completo y correcto.
  // En este ejemplo, la solución correcta es que las celdas contengan 1, 2, 3 / 4, 5, 6 / 7, 8, 9.
  const checkCompletion = (board) => {
    const completado = board.every((pieza, idx) => pieza === idx + 1);
    if (completado && !isComplete) {
      setIsComplete(true);
      const tiempoFinal = Date.now() - startTime;
      if (!bestTime || tiempoFinal < parseInt(bestTime, 10)) {
        setBestTime(tiempoFinal.toString());
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('puzzleBestTime', tiempoFinal.toString());
        }
      }
    }
  };

  // Función para formatear el tiempo (mm:ss).
  const formatTime = (ms) => {
    if (!ms) return '00:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="puzzle-container">
      {/* Inventario de piezas desbloqueadas */}
      <div className="puzzle-inventory">
        <h3 className="inventory-title">
          <Package className="inventory-icon" /> Piezas Disponibles ({unlockedPieces.length})
        </h3>
        <div className="inventory-pieces">
          {unlockedPieces.map(piece => (
            <div
              key={piece}
              className="inventory-piece"
              draggable
              onDragStart={(e) => handleDragStartFromInventory(e, piece)}
            >
              <PuzzlePiece
                id={piece}
                value={piece}
                image={null}
                isCorrect={true}
                // Para inventario se usan valores dummy para currentPosition y correctPosition
                currentPosition={1}
                correctPosition={piece}
                draggable={true}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Encabezado con estadísticas y controles */}
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
              <span>Mejor: {formatTime(parseInt(bestTime, 10))}</span>
            </div>
          )}
        </div>
        <div className="puzzle-controls">
          <button
            className="control-button"
            onClick={initializeBoard}
            title="Reiniciar puzzle"
          >
            <Shuffle size={20} />
          </button>
          <button
            className="control-button"
            onClick={() => {
              // Finaliza el juego colocando la solución correcta.
              setPlacedPieces(Array.from({ length: 9 }, (_, i) => i + 1));
              setIsComplete(true);
            }}
            title="Solución correcta"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Tablero: 9 celdas definidas por el CSS (3x3) */}
      <div className="puzzle-board">
        {placedPieces.map((piece, index) => (
          <div
            key={index}
            className={`puzzle-cell ${piece ? 'filled' : 'empty'}`}
            onDragOver={handleCellDragOver}
            onDrop={(e) => handleCellDrop(e, index)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleRemovePiece(index);
            }}
          >
            {piece && (
              <PuzzlePiece
                id={piece}
                value={piece}
                isCorrect={piece === index + 1}
                // Permite reubicar la pieza: se activa el onDragStart.
                draggable={true}
                onDragStart={(e) => handleDragStartFromCell(e, index)}
                currentPosition={index + 1}
                correctPosition={piece}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mensaje de finalización */}
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

PuzzleBoard.propTypes = {
  correctAnswersCount: PropTypes.number.isRequired,
};

export default PuzzleBoard;
