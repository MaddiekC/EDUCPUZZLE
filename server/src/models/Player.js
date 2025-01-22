import mongoose from 'mongoose'; // Usamos import en lugar de require

const PlayerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  progress: {
    type: Object, // Puede ser un esquema más detallado dependiendo de los requisitos de progreso.
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Métodos personalizados
PlayerSchema.methods.updateScore = function (points) {
  this.score += points;
  return this.save();
};

PlayerSchema.methods.setActive = function (status) {
  this.isActive = status;
  return this.save();
};

PlayerSchema.methods.getProgress = function () {
  return this.progress;
};

// Crear el modelo
const Player = mongoose.model('Player', PlayerSchema);

// Usamos export default para exportar el modelo en ESM
export default Player;
