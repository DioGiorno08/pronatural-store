import { useState, useEffect } from 'react';
import { api } from '../utils/api';
export function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await api.getSales();
      setSales(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const recordSale = async (saleData) => {
    try {
      const newSale = await api.createSale(saleData);
      setSales(prev => [newSale, ...prev]);
      return newSale;
    } catch (err) {
      throw new Error(err.message);
    }
  };
  useEffect(() => {
    fetchSales();
  }, []);
  return { sales, loading, error, refetch: fetchSales, recordSale };
}
