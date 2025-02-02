/* global localStorage */
// client/src/components/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Revisa si existe un token en localStorage.
  // Puedes cambiar la lógica según cómo manejes la autenticación.
  const token = localStorage.getItem("accessToken");

  // Si no existe token, redirige a login
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
