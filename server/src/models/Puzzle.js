import mongoose from 'mongoose';

const PuzzlePieceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Puede ser un número o string
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

// Métodos para el modelo de Puzzle
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
