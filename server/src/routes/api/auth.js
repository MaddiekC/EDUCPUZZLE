import express from 'express';
import AuthController from '../../controllers/authController.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de un nuevo usuario.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: Dilan
 *               password:
 *                 type: string
 *                 example: Dilan123
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente.
 *       400:
 *         description: Error en los datos de entrada.
 *       500:
 *         description: Error en el servidor.
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicio de sesión de un usuario.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: Dilan
 *               password:
 *                 type: string
 *                 example: Dilan123
 *     responses:
 *       200:
 *         description: Usuario autenticado exitosamente.
 *       401:
 *         description: Credenciales inválidas.
 *       500:
 *         description: Error en el servidor.
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificación del token de autenticación.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token válido.
 *       401:
 *         description: Token inválido o expirado.
 */
router.get('/verify', AuthController.verifyToken);

export default router;
