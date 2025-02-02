// client/src/components/PuzzlePiece.jsx
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import './Puzzle.css';

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
  inventory = false  // nueva prop para identificar si se usa en inventario
}, ref) => {
  const inlineStyles = {};
  if (!inventory) {
    inlineStyles.gridRow = Math.floor((currentPosition - 1) / 3) + 1;
    inlineStyles.gridColumn = ((currentPosition - 1) % 3) + 1;
    inlineStyles['--correct-row'] = Math.floor((correctPosition - 1) / 3) + 1;
    inlineStyles['--correct-column'] = ((correctPosition - 1) % 3) + 1;
  }
  return (
    <div
      ref={ref}
      className={`puzzle-piece ${isCorrect ? 'correct' : ''}`}
      style={inlineStyles}
      draggable={draggable}
      onDragStart={(e) => onDragStart && onDragStart(e, id)}
      onDrop={(e) => onDrop && onDrop(e, id)}
      onDragOver={(e) => onDragOver && onDragOver(e)}
      data-position={currentPosition}
      data-value={value}
    >
      <div className="piece-content">
        {image ? (
          <img
            src={image}
            alt={`Puzzle piece ${value}`}
            className="piece-image"
            draggable={false}
          />
        ) : (
          <>
            <span className="piece-value">{value}</span>
            <div className="piece-corners">
              <div className="corner top-left" />
              <div className="corner top-right" />
              <div className="corner bottom-left" />
              <div className="corner bottom-right" />
            </div>
          </>
        )}
      </div>
    </div>
  );
});

PuzzlePiece.displayName = 'PuzzlePiece';

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
