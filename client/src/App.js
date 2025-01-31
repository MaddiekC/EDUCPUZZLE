import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register/Register';
import Login from './components/Login/Login'; 
import BoardSoloPL from './components/Board/BoardSoloPL'; 
import BoardMultiPL from './components/Board/BoardMultiPL'; 
import Lobby from './components/Lobby/Lobby'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/boardSoloPL" element={<BoardSoloPL />} />
        <Route path="/boardMultiPL" element={<BoardMultiPL />} />
      </Routes>
    </Router>
  );
}

export default App;
