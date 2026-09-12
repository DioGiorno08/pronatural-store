import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// creamos el contexto de autenticación para compartir la sesión en la app
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl } from "../config/apiConfig";

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
  // estado para la URL activa del servidor
  const [apiUrl, setApiUrl] = useState("http://172.20.10.3:4000/api");

  // al montar el componente, verificamos si existe una sesión previa guardada y la URL de API
  useEffect(() => {
    const loadSession = async () => {
      try {
        const currentApi = await getApiBaseUrl();
        setApiUrl(currentApi);

        const savedToken = await AsyncStorage.getItem("authCookie");
        const savedUser = await AsyncStorage.getItem("userInfo");

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error al cargar la sesión guardada:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // función para actualizar la URL del backend
  const changeApiUrl = async (newUrl) => {
    const updated = await setApiBaseUrl(newUrl);
    setApiUrl(updated);
    return updated;
  };

  const restoreDefaultApiUrl = async () => {
    const def = await resetApiBaseUrl();
    setApiUrl(def);
    return def;
  };

  // función para iniciar sesión consumiendo el endpoint del backend
  const login = async (email, password) => {
    const currentApi = apiUrl || (await getApiBaseUrl());
    const response = await fetch(`${currentApi}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Credenciales incorrectas.");
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
        const currentApi = apiUrl || (await getApiBaseUrl());
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
    const currentApi = apiUrl || (await getApiBaseUrl());
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
        apiUrl,
        login,
        logout,
        authFetch,
        changeApiUrl,
        restoreDefaultApiUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
