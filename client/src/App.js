//client\src\App.js
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import BoardSoloPL from './components/Board/BoardSoloPL';
import BoardCell from './components/Board/BoardCell';
import Menu from './components/Menu/Menu';
import ProtectedRoute from './components/ProtectedRoute';
import Lobby from './components/Lobby/Lobby';

// Mover el LobbyWrapper antes del componente App
const LobbyWrapper = () => {
  const { gameId } = useParams();
  return <Lobby gameId={gameId} />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/menu" element={<Menu />} />
          <Route path="/boardSoloPL" element={<BoardSoloPL />} />
          {/* Ruta para el BoardCell con parámetro gameId */}
          <Route path="/boardCell/:gameId" element={<BoardCell />} />
          {/* Ruta para el Lobby con parámetro gameId */}
          <Route path="/lobby/:gameId" element={<LobbyWrapper />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;