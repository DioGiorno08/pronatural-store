import { useState, useEffect } from 'react';
import { api } from '../utils/api';
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await api.getSuppliers();
      setSuppliers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const addSupplier = async (supplierData) => {
    try {
      const newSupplier = await api.createSupplier(supplierData);
      setSuppliers(prev => [...prev, newSupplier]);
      return newSupplier;
    } catch (err) {
      throw new Error(err.message);
    }
  };
  useEffect(() => {
    fetchSuppliers();
  }, []);
  return { suppliers, loading, error, refetch: fetchSuppliers, addSupplier };
}
