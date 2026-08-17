import React from "react";

// importamos el proveedor AuthProvider para compartir el estado de autenticación en la app
import { AuthProvider } from "./src/context/AuthContext";

// importamos el navegador principal de la aplicación
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    // envolvemos la aplicación dentro del AuthProvider para la gestión global de usuarios
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
