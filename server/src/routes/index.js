// server/src/routes/index.js
import express from 'express';
import gameRoutes from './api/game.js';
import playerRoutes from './api/player.js';
import authRoutes from './api/auth.js';

const router = express.Router();

// No agregues /api aquí, solo en src/index.js cuando lo uses como middleware
router.use('/game', gameRoutes);  // Esto será /game
router.use('/player', playerRoutes);  // Será /player
router.use('/auth', authRoutes);  // Será /auth

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'EDUCPUZZLE API - Server is running',
    status: 'OK',
  });
});

export default router;
