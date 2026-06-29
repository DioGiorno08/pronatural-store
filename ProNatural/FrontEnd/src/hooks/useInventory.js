import { useState, useEffect } from 'react';
import { api } from '../utils/api';
export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setInventory(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const updateStock = async (id, newStock) => {
    try {
      const updated = await api.updateStock(id, newStock);
      setInventory(prev => prev.map(item => item.id === id ? { ...item, stock: newStock } : item));
      return updated;
    } catch (err) {
      throw new Error(err.message);
    }
  };
  const reorderProduct = async (id, amount) => {
    try {
      const result = await api.reorderProduct(id, amount);
      setInventory(prev => prev.map(item => item.id === id ? { ...item, stock: item.stock + amount } : item));
      return result;
    } catch (err) {
      throw new Error(err.message);
    }
  };
  useEffect(() => {
    fetchInventory();
  }, []);
  return { inventory, loading, error, refetch: fetchInventory, updateStock, reorderProduct };
}
