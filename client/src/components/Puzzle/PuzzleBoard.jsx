/* global localStorage */
// client/src/components/PuzzleBoard.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Package, Shuffle, RotateCcw, Crown } from "lucide-react";
import PuzzlePiece from "./PuzzlePiece";
import "./Puzzle.css";

const PuzzleBoard = ({ correctAnswersCount }) => {
  const getBestTime = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("puzzleBestTime") || null;
    }
    return null;
  };

  const [unlockedPieces, setUnlockedPieces] = useState([]);
  const [placedPieces, setPlacedPieces] = useState(Array(9).fill(null));
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(0);
  const [bestTime, setBestTime] = useState(getBestTime());
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isComplete && startTime) {
      const timer = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, isComplete]);

  const initializeBoard = () => {
    setPlacedPieces(Array(9).fill(null));
    setMoves(0);
    setIsComplete(false);
    setStartTime(Date.now());
  };

  // Actualizamos unlockedPieces cuando cambian correctAnswersCount o placedPieces
  useEffect(() => {
    if (correctAnswersCount < 2) return;
    const piezasNecesarias = 1 + Math.floor((correctAnswersCount - 2) / 3);
    setUnlockedPieces((prev) => {
      const missing = piezasNecesarias - prev.length;
      if (missing > 0) {
        // Ahora solo se filtran las piezas que ya están en unlockedPieces
        const availableNumbers = Array.from(
          { length: 9 },
          (_, i) => i + 1
        ).filter((num) => !prev.includes(num));
        const piezasAAgregar = availableNumbers
          .sort(() => Math.random() - 0.5)
          .slice(0, missing);
        return prev.concat(piezasAAgregar);
      }
      return prev;
    });
  }, [correctAnswersCount]);

  const handleDragStartFromInventory = (e, piece) => {
    e.dataTransfer.setData("text/plain", piece.toString());
  };

  const handleDragStartFromCell = (e, index) => {
    const piece = placedPieces[index];
    if (!piece) return;
    e.dataTransfer.setData("text/plain", piece.toString());
    const newBoard = [...placedPieces];
    newBoard[index] = null;
    setPlacedPieces(newBoard);
    // Agregar solo si aún no está en unlockedPieces:
    setUnlockedPieces((prev) =>
      prev.includes(piece) ? prev : [...prev, piece]
    );
  };

  const handleCellDragOver = (e) => {
    e.preventDefault();
  };

  const handleCellDrop = (e, index) => {
    e.preventDefault();
    const pieceStr = e.dataTransfer.getData("text/plain");
    const piece = parseInt(pieceStr, 10);
    if (piece && !placedPieces[index]) {
      const newBoard = [...placedPieces];
      newBoard[index] = piece;
      setPlacedPieces(newBoard);
      setUnlockedPieces((prev) => prev.filter((p) => p !== piece));
      setMoves((prev) => prev + 1);
      checkCompletion(newBoard);
    }
  };

  const handleRemovePiece = (index) => {
    const pieza = placedPieces[index];
    if (pieza) {
      const newBoard = [...placedPieces];
      newBoard[index] = null;
      setPlacedPieces(newBoard);
      setUnlockedPieces((prev) => [...prev, pieza]);
    }
  };

  const checkCompletion = (board) => {
    const completado = board.every((pieza, idx) => pieza === idx + 1);
    if (completado && !isComplete) {
      setIsComplete(true);
      const tiempoFinal = Date.now() - startTime;
      if (!bestTime || tiempoFinal < parseInt(bestTime, 10)) {
        setBestTime(tiempoFinal.toString());
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("puzzleBestTime", tiempoFinal.toString());
        }
      }
    }
  };

  const formatTime = (ms) => {
    if (!ms) return "00:00";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes.toString().padStart(2, "0")}:${(seconds % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="puzzle-container">
      {/* Inventario de piezas desbloqueadas */}
      <div className="puzzle-inventory">
        <h3 className="inventory-title">
          <Package className="inventory-icon" /> Piezas Disponibles (
          {unlockedPieces.length})
        </h3>
        <div className="inventory-pieces">
          {unlockedPieces.map((piece) => (
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
                currentPosition={1}
                correctPosition={piece}
                draggable={true}
                inventory={true} // Indicamos que se usa en inventario
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
              setPlacedPieces(Array.from({ length: 9 }, (_, i) => i + 1));
              setIsComplete(true);
            }}
            title="Solución correcta"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Tablero de puzzle (3x3) */}
      <div className="puzzle-board">
        {placedPieces.map((piece, index) => (
          <div
            key={index}
            className={`puzzle-cell ${piece ? "filled" : "empty"}`}
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
