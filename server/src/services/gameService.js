import Game from '../models/Game.js'
import Player from '../models/Player.js';
import Puzzle from '../models/Puzzle.js';
import socketService from './socketService.js';

class GameService {

    // Crea un nuevo juego
    async createGame() {
        const newGame = new Game({
            gameState: {}, // Aquí puedes definir un estado inicial para el juego
            players: new Map(),
            currentPuzzle: null,
        });
        await newGame.save();
        return newGame;
    }

    // Agrega un jugador a un juego
    async joinGame(gameId, playerId) {
        const game = await Game.findById(gameId);
        const player = await Player.findById(playerId);
        
        if (!game || !player) {
            throw new Error('Juego o jugador no encontrado');
        }

        // Agregar jugador al juego
        game.players.set(player.id, player);
        await game.save();

        // Notificar a los demás jugadores
        socketService.broadcastUpdate(gameId, 'playerJoined', player);

        return game;
    }

    // Elimina un jugador de un juego
    async leaveGame(gameId, playerId) {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Juego no encontrado');
        }

        // Eliminar jugador del juego
        game.players.delete(playerId);
        await game.save();

        // Notificar a los demás jugadores
        socketService.broadcastUpdate(gameId, 'playerLeft', playerId);

        return game;
    }

    // Inicia el juego
    async startGame(gameId) {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Juego no encontrado');
        }

        // Elige un puzzle y asignalo al juego
        const puzzle = await Puzzle.findOne(); // Deberías elegir un puzzle aleatorio o por dificultad
        game.currentPuzzle = puzzle;
        await game.save();

        // Enviar estado del juego a todos los jugadores
        socketService.broadcastUpdate(gameId, 'gameStarted', game);

        return game;
    }

    // Valida una solución del puzzle
    async validateSolution(gameId, playerId, solution) {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Juego no encontrado');
        }

        const puzzle = game.currentPuzzle;
        if (!puzzle) {
            throw new Error('Puzzle no encontrado');
        }

        // Validar solución
        const isValid = puzzle.validateSolution(solution);
        if (isValid) {
            // Si es correcta, actualizamos el puntaje del jugador
            const player = game.players.get(playerId);
            player.updateScore(10); // Puntaje por resolver el puzzle
            await player.save();
            
            socketService.broadcastUpdate(gameId, 'solutionValid', player);
        } else {
            socketService.broadcastUpdate(gameId, 'solutionInvalid', playerId);
        }

        return isValid;
    }

    // Actualiza el estado del juego
    async updateGameState(gameId, newState) {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Juego no encontrado');
        }

        game.gameState = newState;
        await game.save();

        // Enviar actualización de estado a todos los jugadores
        socketService.broadcastUpdate(gameId, 'gameStateUpdated', newState);

        return game;
    }

    // Obtiene el estado del juego
    async getGameState(gameId) {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Juego no encontrado');
        }

        return game.gameState;
    }

    // Obtiene la lista de jugadores
    async getPlayers(gameId) {
        const game = await Game.findById(gameId);
        if (!game) {
            throw new Error('Juego no encontrado');
        }

        return Array.from(game.players.values());
    }

}

export default new GameService();
