// useGameState.js
import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket/socketService';

const useGameState = (gameId, initialPlayers = []) => {
  const [gameState, setGameState] = useState({
    equation: { left: 9, operator: "x", right: "?", result: 81 },
    players: initialPlayers,
    currentTurn: 0,
    gameStats: {
      totalMoves: 0,
      correctAnswers: 0,
      bestStreak: 0,
    }
  });

  // Add version control for state updates
  const [stateVersion, setStateVersion] = useState(0);

  // Memoize the emit function
  const emitBoardUpdate = useCallback((newState) => {
    const stateWithMetadata = {
      ...newState,
      version: stateVersion + 1,
      timestamp: Date.now()
    };
    
    socketService.emit("boardUpdate", {
      gameId,
      boardState: stateWithMetadata
    });
  }, [gameId, stateVersion]);

  // Enhanced effect for game room management
  useEffect(() => {
    if (!gameId) return;
  
    let mounted = true;
  
    const initializeGame = async () => {
      try {
        await socketService.emit("joinGameBoard", { gameId });
        await socketService.emit("getGameState", { gameId });
      } catch (error) {
        console.error("Error initializing game:", error);
      }
    };
  
    const handleBoardUpdate = (data) => {
      if (!mounted || !data?.gameId || data.gameId !== gameId || !data.boardState) return;
  
      setGameState(prevState => {
        if (data.boardState.version <= prevState.version) return prevState;
        return { ...prevState, ...data.boardState };
      });
    };
  
    initializeGame();
    socketService.on("boardUpdate", handleBoardUpdate);
    socketService.on("gameStateUpdated", handleBoardUpdate);
  
    return () => {
      mounted = false;
      socketService.off("boardUpdate", handleBoardUpdate);
      socketService.off("gameStateUpdated", handleBoardUpdate);
      socketService.emit("leaveGameBoard", { gameId });
    };
  }, [gameId]); // Eliminado stateVersion de las dependencias
  

  // Enhanced state update function with optimistic updates
  const updateGameState = useCallback((updatedState) => {
    setGameState(prevState => {
      const newState = {
        ...prevState,
        ...updatedState,
        version: stateVersion + 1,
        timestamp: Date.now()
      };
      
      // Emit after state is updated
      emitBoardUpdate(newState);
      return newState;
    });
    
    setStateVersion(prev => prev + 1);
  }, [stateVersion, emitBoardUpdate]);

  // Enhanced player turn check
  const isCurrentPlayerTurn = useCallback((playerId) => {
    if (!playerId || !gameState.players?.length) return false;
    
    const currentPlayer = gameState.players[gameState.currentTurn];
    const playerIdStr = playerId.toString();
    
    return currentPlayer && (
      currentPlayer.playerId?.toString() === playerIdStr ||
      currentPlayer._id?.toString() === playerIdStr ||
      currentPlayer.id?.toString() === playerIdStr
    );
  }, [gameState]);

  return {
    gameState,
    updateGameState,
    isCurrentPlayerTurn,
    stateVersion
  };
};

export default useGameState;