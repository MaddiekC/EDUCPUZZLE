import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Asegúrate de que la extensión .js esté incluida si usas ES Modules

class AuthController {
  // Registro de usuario
  async register(req, res) {
    const { username, password } = req.body;
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });

      await newUser.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error registering user', error: err.message });
    }
  }

  // Inicio de sesión de usuario
  async login(req, res) {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET, // Aquí usamos la variable de entorno
        { expiresIn: '1h' }
      );

      res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).json({ message: 'Error logging in', error: err.message });
    }
  }

  // Verificación del token
  async verifyToken(req, res) {
    try {
      const token = req.header('Authorization');
      if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing' });
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = decoded;
        res.status(200).json({ message: 'Token verified successfully', user: req.user });
      });
    } catch (err) {
      res.status(500).json({ message: 'Error verifying token', error: err.message });
    }
  }
}

export default new AuthController();
