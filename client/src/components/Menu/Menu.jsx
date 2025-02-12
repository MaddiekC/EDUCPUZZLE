/* global localStorage */
// client/src/components/Menu/Menu.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { Alert, Snackbar } from "@mui/material";
import axios from "../../api/axios";
import "./Menu.css";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
    success: { main: "#2e7d32" },
  },
});

const Menu = () => {
  const navigate = useNavigate();
  // Se muestran las opciones de multijugador por defecto.
  const [showMultiplayerOptions, setShowMultiplayerOptions] = useState(true);
  const [gameIdInput, setGameIdInput] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [players, setPlayers] = useState([]); // Lista de jugadores (opcional para "Ver Jugadores")
  const [showPlayers, setShowPlayers] = useState(false);

  const username = localStorage.getItem("username") || "Jugador";
  const token = localStorage.getItem("accessToken");

  const generateGameId = () => {
    return "game-" + Date.now();
  };

  const handleCrearPartida = async () => {
    try {
      const gameId = generateGameId();
      const playerId = localStorage.getItem("userId");
      const difficulty = "easy";
  
      console.log("Intentando crear partida con datos:", {
        gameId,
        playerId,
        username,
        difficulty,
      });
  
      const response = await axios.post(
        "/game/initialize", // Asegúrate de que esta URL sea la correcta en tu API
        { gameId, playerId, username, difficulty },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Respuesta del servidor:", response.data);
  
      if (response.data.gameState) {
        console.log("Estado del juego:", response.data.gameState);
        
        // Guardar en localStorage que este usuario es el host
        localStorage.setItem("isHost", "true");
  
        // Redirige al lobby usando el gameId generado.
        navigate(`/lobby/${gameId}`);
      } else {
        throw new Error("No se recibió el estado del juego");
      }
    } catch (error) {
      console.error("Error al crear partida:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      setError(error.response?.data?.message || "Error al crear la partida");
      setShowError(true);
    }
  };
  
  const validateGameId = (gameId) => {
    const gameIdPattern = /^game-\d+$/;
    return gameIdPattern.test(gameId);
  };

  const handleGameIdInput = (e) => {
    const value = e.target.value;
    if (value && !value.startsWith("game-")) {
      setGameIdInput(`game-${value}`);
    } else {
      setGameIdInput(value);
    }
  };

  const handleUnirseAPartida = async () => {
    try {
      if (!validateGameId(gameIdInput)) {
        throw new Error(
          "ID de partida inválido. Debe tener el formato 'game-número'"
        );
      }

      const playerId = localStorage.getItem("userId");

      const response = await axios.post(
        "/game/join",
        { gameId: gameIdInput, playerId, username },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Unido a la partida:", response.data);
      navigate(`/lobby/${gameIdInput}`);
    } catch (error) {
      console.error("Error al unirse a la partida:", error);
      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al unirse a la partida";
      if (error.response?.status === 404) {
        errorMessage = "La partida no existe";
      }
      setError(errorMessage);
      setShowError(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="menu-container">
        <p className="welcome-message">Bienvenido, {username}!</p>
        <h1>Bienvenido al Multijugador</h1>

        <Button
          variant="contained"
          color="secondary"
          onClick={() => setShowMultiplayerOptions(!showMultiplayerOptions)}
        >
          Multijugador
        </Button>

        {showMultiplayerOptions && (
          <div className="multiplayer-options">
            <h2>Opciones de Multijugador</h2>

            <Button
              variant="contained"
              color="primary"
              onClick={handleCrearPartida}
            >
              Crear Partida
            </Button>

            <div className="join-game-container">
              <input
                type="text"
                placeholder="Ingrese ID de partida (ejemplo: game-123456)"
                value={gameIdInput}
                onChange={handleGameIdInput}
                className="input-game-id"
              />
              <Button
                variant="contained"
                color="success"
                onClick={handleUnirseAPartida}
                disabled={!validateGameId(gameIdInput)}
              >
                Unirse a Partida
              </Button>
            </div>

            {showPlayers && (
              <div>
                <h3>Jugadores Activos</h3>
                <ul>
                  {players.map((player) => (
                    <li key={player._id}>
                      {player.username} - Score: {player.score}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <Snackbar
          open={showError}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
        >
          <Alert severity="error" onClose={() => setShowError(false)}>
            {error}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
};

export default Menu;
