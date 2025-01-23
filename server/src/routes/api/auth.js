// server/src/routes/api/auth.js
import express from 'express';
import AuthController from '../../controllers/authController.js'; // Asegúrate de incluir la extensión .js si usas ES Modules

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/verify', AuthController.verifyToken);

export default router;
