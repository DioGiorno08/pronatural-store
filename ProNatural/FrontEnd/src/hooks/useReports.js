import { useState, useEffect } from 'react';
import { api } from '../utils/api';
export function useReports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReportData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReports();
  }, []);
  return { reportData, loading, error, refetch: fetchReports };
}
