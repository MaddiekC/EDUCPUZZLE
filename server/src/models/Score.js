import mongoose from 'mongoose';

// Definir el esquema de puntuaciones
const scoreSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player', // Hace referencia al modelo de Player
      required: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game', // Hace referencia al modelo de Game
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  }
);

// Métodos del modelo

/**
 * Incrementa los puntos del jugador
 * @param {Number} points - Puntos a añadir
 */
scoreSchema.methods.addPoints = function (points) {
  this.points += points;
  return this.save();
};

/**
 * Resetea los puntos del jugador
 */
scoreSchema.methods.resetPoints = function () {
  this.points = 0;
  return this.save();
};

// Métodos estáticos

/**
 * Obtiene la puntuación más alta para un juego específico
 * @param {String} gameId - ID del juego
 * @returns {Promise<Object>} - Puntuación más alta
 */
scoreSchema.statics.getHighScore = async function (gameId) {
  return this.find({ gameId })
    .sort({ points: -1 })
    .limit(1)
    .populate('playerId', 'username')
    .exec();
};

/**
 * Obtiene todas las puntuaciones de un jugador
 * @param {String} playerId - ID del jugador
 * @returns {Promise<Array>} - Lista de puntuaciones
 */
scoreSchema.statics.getScoresByPlayer = async function (playerId) {
  return this.find({ playerId }).sort({ timestamp: -1 }).exec();
};

// Crear el modelo
const Score = mongoose.model('Score', scoreSchema);

export default Score;
