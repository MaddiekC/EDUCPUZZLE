/* global localStorage */
// client/src/components/PuzzleBoard.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {Crown } from "lucide-react";
import PuzzlePiece from "./PuzzlePiece";
import "./Puzzle.css";
import catImage from "../../assets/cat.jpg";

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
  
    // Total de piezas desbloqueadas (en tablero + inventario) según la cantidad de respuestas correctas
    const piezasNecesarias = 1 + Math.floor((correctAnswersCount - 2) / 3);
  
    // Contamos cuántas piezas están colocadas en el tablero
    const piezasColocadas = placedPieces.filter((p) => p !== null).length;
  
    // Calculamos cuántas piezas deberían estar disponibles (en el inventario)
    const piezasEnInventarioDeseadas = piezasNecesarias - piezasColocadas;
  
    setUnlockedPieces((prev) => {
      const piezasDisponiblesActuales = prev.length;
      const missing = piezasEnInventarioDeseadas - piezasDisponiblesActuales;
      if (missing > 0) {
        // Genera un array de objetos (piezas) con id del 1 al 9 y descarta las que ya están desbloqueadas o en el tablero
        const availablePieces = Array.from({ length: 9 }, (_, i) => ({ id: i + 1 }))
          .filter(
            (piece) =>
              !prev.some((p) => p.id === piece.id) &&
              !placedPieces.some((p) => p && p.id === piece.id)
          );
        // Mezcla el array de forma aleatoria y toma las que hacen falta
        const piezasAAgregar = availablePieces.sort(() => Math.random() - 0.5).slice(0, missing);
        return prev.concat(piezasAAgregar);
      }
      return prev;
    });
  }, [correctAnswersCount, placedPieces]);
  

  const handleDragStartFromInventory = (e, pieceObj) => {
    if (!pieceObj || pieceObj.id === undefined) {
      console.error("pieceObj es undefined", pieceObj);
      return;
    }
    e.dataTransfer.setData("text/plain", pieceObj.id.toString());
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
    const pieceId = parseInt(pieceStr, 10);
    // Busca en unlockedPieces el objeto completo con ese id
    const pieceObj = unlockedPieces.find((p) => p.id === pieceId);
    if (pieceObj && !placedPieces[index]) {
      const newBoard = [...placedPieces];
      newBoard[index] = pieceObj; // Guarda el objeto completo
      setPlacedPieces(newBoard);
      setUnlockedPieces((prev) => prev.filter((p) => p.id !== pieceId));
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
          Piezas Disponibles ({unlockedPieces.length})
        </h3>
        <div className="inventory-pieces">
          {unlockedPieces.map((pieceObj) => (
            <div
              key={pieceObj.id}
              className="inventory-piece"
              draggable
              onDragStart={(e) => handleDragStartFromInventory(e, pieceObj)}
            >
              <PuzzlePiece
                id={pieceObj.id}
                value={pieceObj.id}
                image={catImage} // Se pasa la imagen base del gato
                isCorrect={true}
                currentPosition={1}       // O el valor que corresponda para el inventario
                correctPosition={pieceObj.id} // Suponiendo que la posición correcta es el id
                draggable={true}
                inventory={true} // Indica que esta pieza se muestra en el inventario
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
        <img src={catImage} alt="Imagen completa" style={{ width: "100px", height: "auto" }} />
        </div>
      </div>

      {/* Tablero de puzzle (3x3) */}
      <div className="puzzle-board">
        {placedPieces.map((piece, index) => (
          <div
            key={index}
            className={`puzzle-cell ${piece ? "filled" : "empty"}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleCellDrop(e, index)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleRemovePiece(index);
            }}
          >
            {piece && (
              <PuzzlePiece
                id={piece.id}
                value={piece.id}
                image={catImage}  // Se pasa la imagen base para recortar
                isCorrect={piece.id === index + 1}
                draggable={true}
                onDragStart={(e) => handleDragStartFromCell(e, index)}
                currentPosition={index + 1}
                correctPosition={piece.id} // O la posición correcta que corresponda
              />
            )}
          </div>
        ))}
      </div>


      {/* Mensaje de finalización */}
      {isComplete && (
        <div className="completion-message">
          ¡Puzzle completado! 🎉
          <img src={catImage} alt="Imagen completa" />
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
