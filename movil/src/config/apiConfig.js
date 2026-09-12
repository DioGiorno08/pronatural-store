import AsyncStorage from "@react-native-async-storage/async-storage";

// URL por defecto en la nube (producción en Render) y fallback local
export const DEFAULT_CLOUD_URL = "https://pronatural-backend.onrender.com/api";
export const DEFAULT_LOCAL_URL = "http://172.20.10.3:4000/api";

const STORAGE_KEY = "custom_api_base_url";

// Obtener la URL base configurada (o la predeterminada)
export const getApiBaseUrl = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, "");
    }
  } catch (err) {
    console.warn("No se pudo leer URL de API personalizada:", err);
  }
  return DEFAULT_LOCAL_URL;
};

// Guardar una nueva URL base personalizada
export const setApiBaseUrl = async (url) => {
  try {
    if (!url || !url.trim()) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return DEFAULT_LOCAL_URL;
    }
    const cleanUrl = url.trim().replace(/\/+$/, "");
    await AsyncStorage.setItem(STORAGE_KEY, cleanUrl);
    return cleanUrl;
  } catch (err) {
    console.error("Error al guardar URL de API personalizada:", err);
    throw err;
  }
};

// Restaurar la URL por defecto
export const resetApiBaseUrl = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return DEFAULT_LOCAL_URL;
  } catch (err) {
    console.error("Error al restablecer URL de API:", err);
    throw err;
  }
};

// Probar la conectividad con el servidor mediante un ping
export const testApiConnection = async (url) => {
  const target = url || (await getApiBaseUrl());
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(`${target}/products`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Date.now() - start;
    return {
      success: res.ok,
      status: res.status,
      latency,
      message: res.ok
        ? `Conexión exitosa (${latency}ms)`
        : `Servidor respondió con código ${res.status}`,
    };
  } catch (err) {
    const latency = Date.now() - start;
    return {
      success: false,
      latency,
      message:
        err.name === "AbortError"
          ? "Tiempo de espera agotado (7s)"
          : `Error de conexión: ${err.message || "Servidor no disponible"}`,
    };
  }
};

export default {
  DEFAULT_CLOUD_URL,
  DEFAULT_LOCAL_URL,
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  testApiConnection,
};
