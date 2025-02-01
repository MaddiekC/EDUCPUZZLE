import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import "./Lobby.css";
import { useNavigate } from 'react-router-dom';

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
    return (
        <ThemeProvider theme={theme}>
            <div className="lobby-container">
                <button onClick={() => navigate('/boardSoloPL')}>Solo</button>
                <button onClick={() => navigate('/boardMultiPL')}>Multijugador</button>
                <button onClick={() => navigate('/boardCell')}>Board Cell</button>
            </div>
        </ThemeProvider>
    );
};

export default Lobby;
