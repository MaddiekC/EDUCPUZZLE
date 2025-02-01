// client/src/App.js

import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register/Register';
import Login from './components/Login/Login'; 
import BoardSoloPL from './components/Board/BoardSoloPL'; 
import BoardMultiPL from './components/Board/BoardMultiPL'; 
import BoardCell from './components/Board/BoardCell';
import Lobby from './components/Lobby/Lobby'; 

function App() {
  console.log('Renderizando BoardCell...');
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/boardSoloPL" element={<BoardSoloPL />} />
        <Route path="/boardMultiPL" element={<BoardMultiPL />} />
        <Route path="/boardCell" element={<BoardCell />} />
      </Routes>
    </Router>
  );
}

export default App;
