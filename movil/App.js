import React from "react";

import { SafeAreaProvider } from "react-native-safe-area-context";

// importamos el proveedor AuthProvider para compartir el estado de autenticación en la app
import { AuthProvider } from "./src/context/AuthContext";

// importamos el navegador principal de la aplicación
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    // envolvemos la aplicación dentro del AuthProvider y SafeAreaProvider para compatibilidad total con pantallas
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
