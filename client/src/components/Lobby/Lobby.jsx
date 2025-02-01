import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import "./Lobby.css";

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const Lobby = () => {
    const navigate = useNavigate();
    const [showMultiplayerOptions, setShowMultiplayerOptions] = useState(false);
    const [gameId, setGameId] = useState("");

    return (
        <ThemeProvider theme={theme}>
            <div className="lobby-container">
                <h1>Selecciona un modo de juego</h1>

                {/* Botón para jugar solo */}
                <Button variant="contained" color="primary" onClick={() => navigate("/boardSoloPL")}>
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
                        <Button variant="contained" color="primary" onClick={() => navigate("/BoardMultiPL")}>
                            Crear Partida
                        </Button>

                        {/* Campo para ingresar ID de partida y botón para unirse */}
                        <input
                            type="text"
                            placeholder="O Ingrese ID de partida"
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                            className="input-game-id"
                        />
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => navigate(`/joinGame/${gameId}`)}
                            disabled={!gameId} // Deshabilita el botón si no se ha ingresado un ID
                        >
                            Unirse a Partida
                        </Button>
                    </div>
                )}
            </div>
        </ThemeProvider>
    );
};

export default Lobby;
