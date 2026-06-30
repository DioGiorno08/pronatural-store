import { useContext, useState, useEffect } from 'react';
import { GlobalDataContext } from '../context/GlobalDataContext';
import { api } from '../utils/api';
export function useProducts() {
  const globalData = useContext(GlobalDataContext);
  if (globalData) {
    return {
      products: globalData.products,
      loading: false,
      error: null,
      refetch: () => {}
    };
  }
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  return { products, loading, error, refetch: fetchProducts };
}
