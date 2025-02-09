/* global localStorage */

import axios from 'axios';

// Interceptor para manejar errores globalmente
axios.interceptors.response.use(
    response => response,
    error => {
        console.error('Ocurrió un error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para agregar el token de autenticación en las cabeceras si existe
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('authToken'); // o sessionStorage, dependiendo de tu elección
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Configuración de axios con variables de entorno y timeout
export default axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://192.168.100.13:5000/api', // El prefijo /api ya está incluido
    timeout: 5000, // 5 segundos de espera
    headers: {
        'Content-Type': 'application/json',
    }
});
