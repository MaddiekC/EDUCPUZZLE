// server/src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

class AuthController {
  // Registra un nuevo usuario
  async register(req, res) {
    const { username, password } = req.body;
    
    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Crea un nuevo usuario
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      
      await newUser.save();
      
      // Responde con el usuario creado
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error registering user', error: err.message });
    }
  }

  // Inicia sesión de un usuario
  async login(req, res) {
    const { username, password } = req.body;
    
    try {
      // Verificar si el usuario existe
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      // Verificar la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      // Crear un token JWT
      const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Responder con el token
      res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).json({ message: 'Error logging in', error: err.message });
    }
  }

  // Verifica el token JWT del usuario
  async verifyToken(req, res) {
    try {
      const token = req.header('Authorization');
      if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing' });
      }

      // Verifica el token
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
        
        // Token válido
        req.user = decoded;
        res.status(200).json({ message: 'Token verified successfully', user: req.user });
      });
    } catch (err) {
      res.status(500).json({ message: 'Error verifying token', error: err.message });
    }
  }
}

export default new AuthController();
