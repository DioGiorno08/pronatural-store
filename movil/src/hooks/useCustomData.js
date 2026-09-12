import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getApiBaseUrl } from "../config/apiConfig";

const useCustomData = (endpoint = "/products") => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authCookie");
      const apiBase = await getApiBaseUrl();

      const response = await fetch(`${apiBase}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Cookie: `authCookie=${token}` } : {}),
        },
        credentials: "include",
      });

      const jsonData = await response.json();

      if (response.ok) {
        setData(jsonData.data || jsonData || []);
      } else {
        setError(jsonData.message || "Error al obtener los datos");
      }
    } catch (err) {
      console.error("Error al consultar la API:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
};

export default useCustomData;
