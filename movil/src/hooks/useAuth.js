import { useContext } from "react";

// importamos el contexto AuthContext para acceder al estado de autenticación
import { AuthContext } from "../context/AuthContext";

// Hook personalizado para acceder a los datos de sesión y autenticación
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider.");
  }

  return context;
};

export default useAuth;
