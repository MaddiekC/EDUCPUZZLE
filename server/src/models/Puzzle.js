// server/src/models/Puzzle.js
import mongoose from 'mongoose';

const PuzzlePieceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  isPlaced: { type: Boolean, default: false },
});

const PuzzleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  equation: { type: String, required: true },
  solution: { type: Number, required: true },
  pieces: { type: [PuzzlePieceSchema], required: true },
});

// Métodos para el Puzzle
PuzzleSchema.methods.getState = function () {
  return {
    id: this.id,
    difficulty: this.difficulty,
    equation: this.equation,
    pieces: this.pieces.map(piece => ({
      id: piece.id,
      value: piece.value,
      position: piece.position,
      isPlaced: piece.isPlaced,
    })),
  };
};

PuzzleSchema.methods.validateSolution = function (submittedSolution) {
  return submittedSolution === this.solution;
};

PuzzleSchema.methods.shufflePieces = function () {
  this.pieces.sort(() => Math.random() - 0.5);
};

PuzzleSchema.methods.checkProgress = function () {
  return this.pieces.every(piece => piece.isPlaced);
};

export default mongoose.model('Puzzle', PuzzleSchema);
