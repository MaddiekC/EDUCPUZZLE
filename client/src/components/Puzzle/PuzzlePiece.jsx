// client/src/components/PuzzlePiece.jsx
import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import "./Puzzle.css";

const PuzzlePiece = forwardRef(({
  id,
  value,
  image,
  isCorrect,
  currentPosition,
  correctPosition,
  onDragStart,
  onDrop,
  onDragOver,
  draggable = true,
  inventory = false
}, ref) => {
  const inlineStyles = {};

  if (!inventory) {
    // Si la pieza se muestra en el tablero (no en el inventario)
    inlineStyles.gridRow = Math.floor((currentPosition - 1) / 3) + 1;
    inlineStyles.gridColumn = ((currentPosition - 1) % 3) + 1;
  }

  // Si se pasa la imagen, aplicamos estilos para recortar la imagen en función del id
  if (image) {
    const rows = 3;
    const cols = 3;
    // Calculamos la fila y columna correcta (0-indexed) según el correctPosition
    const correctRow = Math.floor((correctPosition - 1) / cols);
    const correctCol = (correctPosition - 1) % cols;
    inlineStyles.backgroundImage = `url(${image})`;
    inlineStyles.backgroundSize = `${cols * 100}% ${rows * 100}%`; // Ej.: "300% 300%"
    inlineStyles.backgroundPosition = `-${correctCol * 100}% -${correctRow * 100}%`;
  }

  return (
    <div
      ref={ref}
      className={`puzzle-piece ${isCorrect ? "correct" : ""}`}
      style={inlineStyles}
      draggable={draggable}
      onDragStart={(e) => onDragStart && onDragStart(e, id)}
      onDrop={(e) => onDrop && onDrop(e, id)}
      onDragOver={(e) => onDragOver && onDragOver(e)}
      data-position={currentPosition}
      data-value={value}
    >
      {/* Si no se provee la imagen, se muestra un fallback (número, etc.) */}
      {!image && (
        <div className="piece-content">
          <span className="piece-value">{value}</span>
        </div>
      )}
    </div>
  );
});

PuzzlePiece.displayName = "PuzzlePiece";

PuzzlePiece.propTypes = {
  id: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  image: PropTypes.string,
  isCorrect: PropTypes.bool,
  currentPosition: PropTypes.number.isRequired,
  correctPosition: PropTypes.number.isRequired,
  onDragStart: PropTypes.func,
  onDrop: PropTypes.func,
  onDragOver: PropTypes.func,
  draggable: PropTypes.bool,
  inventory: PropTypes.bool,
};

export default PuzzlePiece;
