// server/src/controllers/puzzleController.js
import Puzzle from '../models/Puzzle';
import Game from '../models/Game';
import socketService from '../services/socketService';

class PuzzleController {
  constructor() {
    this.socketManager = socketService;
  }

  // Crea un nuevo rompecabezas
  async createPuzzle(req, res) {
    try {
      const { gameId } = req.body;

      // Verifica si el juego existe
      const game = Game.findById(gameId);
      if (!game) {
        return res.status(400).json({ message: 'Game not found' });
      }

      // Crea un nuevo rompecabezas y lo asigna al juego
      const puzzle = new Puzzle();
      game.currentPuzzle = puzzle;

      // Actualiza el estado del juego y emite la actualización
      game.updateGameState();
      this.socketManager.broadcastUpdate(game);

      res.status(200).json({
        message: 'Puzzle created successfully',
        puzzleState: puzzle.getState(),
        gameState: game.getState(),
      });
    } catch (err) {
      res.status(500).json({ message: 'Error creating puzzle', error: err.message });
    }
  }

  // Resuelve el rompecabezas
  async solvePuzzle(req, res) {
    try {
      const { gameId, solution } = req.body;

      // Verifica si el juego existe
      const game = Game.findById(gameId);
      if (!game) {
        return res.status(400).json({ message: 'Game not found' });
      }

      // Verifica si hay un rompecabezas en el juego
      if (!game.currentPuzzle) {
        return res.status(400).json({ message: 'No puzzle found in the game' });
      }

      // Intenta resolver el rompecabezas
      const puzzle = game.currentPuzzle;
      const isSolved = puzzle.checkSolution(solution);

      if (isSolved) {
        // Si el rompecabezas está resuelto, pasa al siguiente rompecabezas o finaliza el juego
        game.advanceToNextPuzzle();
        this.socketManager.broadcastUpdate(game);
        res.status(200).json({
          message: 'Puzzle solved successfully',
          gameState: game.getState(),
        });
      } else {
        res.status(400).json({ message: 'Incorrect solution' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error solving puzzle', error: err.message });
    }
  }

  // Verifica el estado actual del rompecabezas
  getPuzzleState(req, res) {
    try {
      const { gameId } = req.params;

      // Verifica si el juego existe
      const game = Game.findById(gameId);
      if (!game) {
        return res.status(400).json({ message: 'Game not found' });
      }

      // Verifica si hay un rompecabezas en el juego
      if (!game.currentPuzzle) {
        return res.status(400).json({ message: 'No puzzle found in the game' });
      }

      // Devuelve el estado del rompecabezas
      const puzzleState = game.currentPuzzle.getState();
      res.status(200).json({
        message: 'Puzzle state fetched successfully',
        puzzleState,
      });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching puzzle state', error: err.message });
    }
  }
}

export default new PuzzleController();
