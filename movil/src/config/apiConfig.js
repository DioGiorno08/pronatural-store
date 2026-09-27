// URL fija del backend publicado en Render.
export const DEFAULT_CLOUD_URL = "https://pronatural-backend.onrender.com/api";

// La aplicación administrativa siempre utiliza el backend publicado en Render.
export const getApiBaseUrl = async () => {
  return DEFAULT_CLOUD_URL;
};

export default {
  DEFAULT_CLOUD_URL,
  getApiBaseUrl,
};
