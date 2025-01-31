import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import "./Board.css";
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

const BoardMultiPL = () => {
    const navigate = useNavigate();
    return (
        <ThemeProvider theme={theme}>
            <div className="MultiPlayer-container">
                <button onClick={() => navigate('/lobby')}>Regresar</button>
            </div>
        </ThemeProvider>
    );
}

export default BoardMultiPL;
