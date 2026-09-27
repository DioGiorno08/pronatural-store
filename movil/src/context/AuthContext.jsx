import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getApiBaseUrl } from "../config/apiConfig";
import { isAdministrativeUser } from "../utils/accessControl";

// creamos el contexto de autenticación para compartir la sesión en la app
export const AuthContext = createContext();

// Proveedor del contexto que envuelve la aplicación
export const AuthProvider = ({ children }) => {
  // estado para almacenar los datos del usuario logueado
  const [user, setUser] = useState(null);
  // estado para almacenar la cookie/token de sesión
  const [token, setToken] = useState(null);
  // estado para controlar si la app está verificando la sesión inicial
  const [loading, setLoading] = useState(true);
  // al montar el componente, verificamos si existe una sesión previa guardada y la URL de API
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("authCookie");
        const savedUser = await AsyncStorage.getItem("userInfo");

        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          if (isAdministrativeUser(parsedUser)) {
            setToken(savedToken);
            setUser(parsedUser);
          } else {
            await AsyncStorage.multiRemove(["authCookie", "userInfo"]);
          }
        }
      } catch (error) {
        console.error("Error al cargar la sesión guardada:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const updateUserProfile = async (profileData) => {
    const data = await authFetch("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    if (data.user) {
      await AsyncStorage.setItem("userInfo", JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  // función para iniciar sesión consumiendo el endpoint del backend
  const login = async (email, password) => {
    const currentApi = await getApiBaseUrl();
    const response = await fetch(`${currentApi}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Credenciales incorrectas.");
    }

    if (!isAdministrativeUser(data.user)) {
      throw new Error("Esta aplicación es solo para personal administrativo.");
    }

    if (!data.token) {
      throw new Error("El servidor no devolvió una sesión válida.");
    }

    // guardamos el token e información del usuario en AsyncStorage
    await AsyncStorage.setItem("authCookie", data.token);
    await AsyncStorage.setItem("userInfo", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  // función para cerrar la sesión activa del usuario
  const logout = async () => {
    try {
      if (token) {
        const currentApi = await getApiBaseUrl();
        await fetch(`${currentApi}/auth/logout`, {
          method: "POST",
          headers: { Cookie: `authCookie=${token}` },
          credentials: "include",
        });
      }
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    } finally {
      await AsyncStorage.removeItem("authCookie");
      await AsyncStorage.removeItem("userInfo");
      setToken(null);
      setUser(null);
    }
  };

  // función auxiliar para realizar peticiones HTTP incluyendo la cookie de autenticación
  const authFetch = async (endpoint, options = {}) => {
    const currentApi = await getApiBaseUrl();
    const res = await fetch(`${currentApi}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Cookie: `authCookie=${token}` } : {}),
        ...options.headers,
      },
      credentials: "include",
      ...options,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Error en la petición: ${res.status}`);
    }

    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        authFetch,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
