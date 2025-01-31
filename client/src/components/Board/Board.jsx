import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import "./Board.css";
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <Button variant="contained" color="primary">
          ¡Botón Personalizado!
        </Button>
      </div>
    </ThemeProvider>
  );
}

export default App;
