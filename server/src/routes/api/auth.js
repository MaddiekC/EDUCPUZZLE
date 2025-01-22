// server/src/routes/api/auth.js
import express from 'express';
import AuthController from '../../controllers/authController';

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', AuthController.register);

// Ruta para iniciar sesión
router.post('/login', AuthController.login);

// Ruta para verificar el token JWT
router.get('/verify', AuthController.verifyToken);

export default router;
