// server/src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,  // Un username único
  },
  password: {
    type: String,
    required: true,  // La contraseña del usuario
  },
});

const User = mongoose.model('User', userSchema);

export default User;
