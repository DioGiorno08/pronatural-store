import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base del backend de la aplicación
const API_BASE = 'http://192.168.0.15:4000/api';

// Cliente API global para realizar peticiones HTTP con cookies de sesión
export const apiClient = async (endpoint, options = {}) => {
  const cookie = await AsyncStorage.getItem('authCookie');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { 'Cookie': `authCookie=${cookie}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data;
};

export default apiClient;
