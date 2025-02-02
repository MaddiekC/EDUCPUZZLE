// server/src/models/Player.js
import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: [true, "El campo 'username' es obligatorio"], 
      trim: true 
    },
    score: { 
      type: Number, 
      default: 0 
    },
    // Puedes agregar otros campos según tus necesidades, por ejemplo:
    // avatar: { type: String }
  },
  { timestamps: true }
);

/**
 * Método para actualizar el puntaje del jugador.
 * Suma la cantidad de puntos indicada y guarda los cambios en la BD.
 * @param {number} points - Cantidad de puntos a sumar.
 * @returns {Promise<Player>} - El jugador actualizado.
 */
playerSchema.methods.updateScore = async function (points) {
  if (typeof points !== 'number') {
    throw new Error('El valor de points debe ser un número');
  }
  this.score += points;
  await this.save();
  return this;
};

const Player = mongoose.model('Player', playerSchema);

export default Player;
