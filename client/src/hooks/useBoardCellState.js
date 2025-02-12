/* global localStorage */
// client/src/hooks/useBoardCellState.js
import { useState, useEffect } from "react";
import socketService from "../../services/socket/socketService";
import { generateNewEquation } from "../../services/game/equationGenerator";

const useBoardCellState = (gameId, initialPlayers = []) => {
  const [equation, setEquation] = useState({ left: 9, operator: "x", right: "?", result: 81 });
  const [players, setPlayers] = useState(initialPlayers);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [gameStats, setGameStats] = useState({
    totalMoves: 0,
    correctAnswers: 0,
    bestStreak: 0,
  });

  // Lógica para cargar el estado guardado de localStorage, etc.
  // Lógica para unirse a la sala y escuchar "boardUpdate" del socket.
  useEffect(() => {
    if (!gameId) return;
    socketService.emit("joinGameBoard", { gameId });
    const handleBoardUpdate = (data) => {
      if (data.gameId === gameId && data.boardState) {
        const { equation, players, currentTurn, gameStats } = data.boardState;
        setEquation(equation);
        setPlayers(players);
        setCurrentTurn(currentTurn);
        setGameStats(gameStats);
      }
    };
    socketService.on(`boardUpdate:${gameId}`, handleBoardUpdate);
    return () => {
      socketService.off(`boardUpdate:${gameId}`, handleBoardUpdate);
      socketService.emit("leaveGameBoard", { gameId });
    };
  }, [gameId]);

  const emitBoardUpdate = (boardState) => {
    socketService.emit("boardUpdate", { gameId, boardState });
    localStorage.setItem("boardCellState", JSON.stringify(boardState));
  };

  // Función para actualizar el estado del board (por ejemplo, después de una jugada o timeout)
  const updateBoardState = (updatedState) => {
    // Aquí se pueden encapsular las lógicas de actualización de players, turnos, etc.
    emitBoardUpdate(updatedState);
  };

  return { equation, setEquation, players, setPlayers, currentTurn, setCurrentTurn, gameStats, setGameStats, updateBoardState };
};

export default useBoardCellState;
