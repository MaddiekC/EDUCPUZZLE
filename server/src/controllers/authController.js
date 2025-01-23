import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class AuthController {
  // Registro de usuario
  async register(req, res) {
    const { username, password } = req.body;
    
    // Validaciones adicionales de entrada
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Validación de longitud y complejidad de contraseña
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hashear contraseña con sal más segura
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Crear nuevo usuario
      const newUser = new User({ 
        username, 
        password: hashedPassword 
      });
      
      await newUser.save();
      
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ 
        message: 'Error registering user', 
        error: err.message 
      });
    }
  }

  // Inicio de sesión de usuario
  async login(req, res) {
    const { username, password } = req.body;
    
    // Validaciones de entrada
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
      // Buscar usuario
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: user._id, 
          username: user.username 
        },
        process.env.JWT_SECRET, // Variable de entorno
        { 
          expiresIn: '1h',  // Token expira en 1 hora
          issuer: 'EducPuzzle' // Emisor del token
        }
      );

      res.status(200).json({ 
        message: 'Login successful', 
        token,
        userId: user._id
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ 
        message: 'Error logging in', 
        error: err.message 
      });
    }
  }

  // Verificación del token
  async verifyToken(req, res) {
    // Extraer token del header de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Extraer token de la cabecera (Bearer token)
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Malformed token' });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar si el usuario aún existe
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      res.status(200).json({ 
        message: 'Token verified successfully', 
        user: {
          id: user._id,
          username: user.username
        }
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      
      console.error('Token verification error:', err);
      res.status(401).json({ 
        message: 'Invalid token', 
        error: err.message 
      });
    }
  }
}

export default new AuthController();