/* global localStorage */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import axios from "../../api/axios"; // Asegúrate de tener configurado axios
import "./Menu.css";

// Tema de Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    success: {
      main: "#2e7d32",
    },
  },
});

const Menu = () => {
  const navigate = useNavigate();
  const [showMultiplayerOptions, setShowMultiplayerOptions] = useState(false);
  const [gameIdInput, setGameIdInput] = useState("");

  // Recuperar el nombre de usuario guardado en el localStorage.
  // Si no existe, se muestra "Jugador" por defecto.
  const username = localStorage.getItem("username") || "Jugador";

  // Función para generar un ID único para el juego.
  const generateGameId = () => {
    return "game-" + Date.now();
  };

  // Función para manejar la creación de la partida
  const handleCrearPartida = async () => {
    try {
      // Generamos un ID de juego, por ejemplo usando la fecha actual
      const gameId = generateGameId();

      // Recuperamos el token, userId y username desde el localStorage
      const token = localStorage.getItem("accessToken");
      const playerId = localStorage.getItem("userId");
      const difficulty = "easy"; // O permitir al usuario seleccionar la dificultad

      // Llamada al endpoint de inicialización del juego
      const response = await axios.post(
        "/game/initialize", // Asegúrate que esta ruta coincida con la definida en tu backend
        JSON.stringify({ gameId, playerId, username, difficulty }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Juego creado:", response.data);

      // Redirigir al usuario al tablero del juego utilizando el gameId creado
      navigate(`/BoardCell/${gameId}`);
    } catch (error) {
      console.error("Error al crear partida:", error);
      // Aquí puedes mostrar un mensaje de error al usuario si lo deseas
    }
  };

  // Función para manejar el ingreso a una partida existente
  const handleUnirseAPartida = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const playerId = localStorage.getItem("userId");

      // Llamada al endpoint para unirse a la partida (implementado en tu backend)
      const response = await axios.post(
        "/game/join", // Asegúrate que esta ruta coincida con la definida en tu backend
        JSON.stringify({ gameId: gameIdInput, playerId, username }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Unido a la partida:", response.data);

      // Redirigir al usuario al tablero de la partida
      navigate(`/BoardCell/${gameIdInput}`);
    } catch (error) {
      console.error("Error al unirse a la partida:", error);
      // Aquí puedes mostrar un mensaje de error al usuario si lo deseas
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="menu-container">
        {/* Mensaje de bienvenida mostrando el nombre del usuario */}
        <p className="welcome-message">Bienvenido, {username}!</p>
        <h1>Selecciona un modo de juego</h1>

        {/* Botón para jugar solo */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/boardSoloPL")}
        >
          Solo
        </Button>

        {/* Botón para multijugador */}
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setShowMultiplayerOptions(!showMultiplayerOptions)}
        >
          Multijugador
        </Button>

        {/* Opciones de multijugador */}
        {showMultiplayerOptions && (
          <div className="multiplayer-options">
            <h2>Opciones de Multijugador</h2>

            {/* Botón para crear partida */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleCrearPartida}
            >
              Crear Partida
            </Button>

            {/* Campo para ingresar ID de partida y botón para unirse */}
            <input
              type="text"
              placeholder="O ingrese ID de partida"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              className="input-game-id"
            />
            <Button
              variant="contained"
              color="success"
              onClick={handleUnirseAPartida}
              disabled={!gameIdInput} // Deshabilita el botón si no se ha ingresado un ID
            >
              Unirse a Partida
            </Button>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default Menu;
