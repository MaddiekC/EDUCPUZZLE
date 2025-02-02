/* global localStorage */

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Cambiar con la URL de tu API backend
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Obtener token JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
