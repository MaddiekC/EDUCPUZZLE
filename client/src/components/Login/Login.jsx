// src/components/Login.js
import { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';  // Para redirigir después del login

const Login = () => {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await API.post('/auth/login', { user, password });
            // Guardar el token en el localStorage
            localStorage.setItem('token', response.data.token);

            // Redirigir al usuario a la página principal o a donde quieras
            navigate('/home');  // O cualquier ruta a la que quieras redirigir

        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Error en el login');
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Usuario"
                onChange={(e) => setUser(e.target.value)}
                value={user}
            />
            <input
                type="password"
                placeholder="Contraseña"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
            />
            <button onClick={handleLogin}>Iniciar sesión</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;
