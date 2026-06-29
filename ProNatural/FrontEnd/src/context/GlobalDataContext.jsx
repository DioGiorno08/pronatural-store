import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export const GlobalDataContext = createContext();
export function useGlobalData() {
  return useContext(GlobalDataContext);
}

export function GlobalDataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Data still fully local for now:
  const [reviews, setReviews] = useState(() => JSON.parse(localStorage.getItem('pronatural_reviews')) || []);
  const [users, setUsers] = useState([]); // This will now hold our Empleados from MongoDB
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // Cargar datos reales del backend al iniciar
    const fetchAllData = async () => {
      try {
        const [apiProducts, apiSales, apiCategories, apiEmployees, apiCustomers] = await Promise.all([
          api.getProducts().catch(e => { console.error("Error fetching products:", e); return []; }),
          api.getSales().catch(e => { console.error("Error fetching sales:", e); return []; }),
          api.getCategories().catch(e => { console.error("Error fetching categories:", e); return []; }),
          api.getEmployees().catch(e => { console.error("Error fetching employees:", e); return []; }),
          api.getClientes().catch(e => { console.error("Error fetching customers:", e); return []; })
        ]);
        setProducts(Array.isArray(apiProducts) ? apiProducts : []);
        setSales(Array.isArray(apiSales) ? apiSales : []);
        setCategories(Array.isArray(apiCategories) ? apiCategories : []);
        setUsers(Array.isArray(apiEmployees) ? apiEmployees : []);
        setCustomers(Array.isArray(apiCustomers) ? apiCustomers : []);
      } catch (error) {
        console.error("Error loading data from backend:", error);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => { localStorage.setItem('pronatural_reviews', JSON.stringify(reviews)); }, [reviews]);

  const addProduct = async (product) => {
    try {
      const saved = await api.createProduct(product);
      setProducts(prev => [saved, ...prev]);
    } catch (e) {
      console.error("Error adding product:", e);
      throw e; // Let the component handle the error
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const updated = await api.updateProduct(id, updatedData);
      setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, ...updated } : p));
    } catch (e) {
      console.error("Error updating product:", e);
      throw e;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id && p.id !== id));
    } catch(e) {
      console.error("Error deleting product:", e);
      throw e;
    }
  };

  const addCategory = async (category) => {
    try {
      const res = await api.createCategory({ name: category.name || category, description: category.description || "" });
      setCategories(prev => [...prev, res.category || res]);
    } catch (e) {
      console.error("Error adding category:", e);
      // fallback just in case it's a string
      setCategories(prev => [...new Set([...prev, category])]);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id && c !== id));
    } catch (e) {
      console.error("Error deleting category:", e);
      setCategories(prev => prev.filter(c => c.id !== id && c !== id));
    }
  };

  const updateCategory = async (id, updatedData) => {
    try {
      const res = await api.updateCategory(id, updatedData);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...res.category } : c));
    } catch (e) {
      console.error("Error updating category:", e);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    }
  };
  const addSale = (saleData) => {
    const items = saleData.items || [];
    let newProducts = [...products];
    items.forEach(item => {
      const pIdx = newProducts.findIndex(p => p.id === item.id);
      if (pIdx >= 0) {
        newProducts[pIdx] = { ...newProducts[pIdx], stock: Math.max(0, newProducts[pIdx].stock - item.quantity) };
      }
    });
    setProducts(newProducts);
    const newSale = {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      ...saleData
    };
    setSales(prev => [newSale, ...prev]);
  };
  const deleteSale = (id) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };
  const addReview = (review) => {
    setReviews(prev => [{ ...review, id: Date.now() }, ...prev]);
  };
  const deleteReview = (id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };
  const addUser = async (user) => {
    try {
      const saved = await api.createEmployee(user);
      setUsers(prev => [saved, ...prev]);
    } catch (e) {
      console.error("Error adding employee:", e);
      throw e;
    }
  };
  const updateUser = async (id, updatedUser) => {
    try {
      const updated = await api.updateEmployee(id, updatedUser);
      setUsers(prev => prev.map(u => (u.id === id || u._id === id) ? { ...u, ...updated } : u));
    } catch (e) {
      console.error("Error updating employee:", e);
      throw e;
    }
  };
  const deleteUser = async (id) => {
    try {
      await api.deleteEmployee(id);
      setUsers(prev => prev.filter(u => u.id !== id && u._id !== id));
    } catch (e) {
      console.error("Error deleting employee:", e);
      throw e;
    }
  };
  const addCustomer = async (customer) => {
    try {
      const saved = await api.createCliente(customer);
      setCustomers(prev => [saved, ...prev]);
    } catch(e) {
      console.error(e);
      throw e;
    }
  };
  const updateCustomer = async (id, updatedCustomer) => {
    try {
      const res = await api.updateCliente(id, updatedCustomer);
      const updated = res.customer || updatedCustomer; // Handle case where it returns { customer: ... }
      
      // Also map the data so it renders immediately correctly
      const mappedUpdated = {
        ...updated,
        name: updated.name || updated.nombre || '',
        lastName: updated.lastName || updated.apellido || '',
        email: updated.email || updated.correo || '',
        phone: updated.telefono || updated.phone || '',
        birthdate: updated.birthdate || updated.fechaNacimiento || '',
        status: updated.status || 'Active'
      };

      setCustomers(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, ...mappedUpdated } : c));
    } catch(e) {
      console.error(e);
      throw e;
    }
  };
  const deleteCustomer = async (id) => {
    try {
      await api.deleteCliente(id);
      setCustomers(prev => prev.filter(c => c.id !== id && c._id !== id));
    } catch(e) {
      console.error(e);
      throw e;
    }
  };
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOrders = sales.length;
  const activeInventory = products.reduce((acc, curr) => acc + curr.stock, 0);
  const totalItemsSold = sales.reduce((acc, curr) => {
    if (Array.isArray(curr.items)) {
      return acc + curr.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    return acc + (typeof curr.items === 'number' ? curr.items : 1);
  }, 0);
  return (
    <GlobalDataContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      sales,
      addSale,
      deleteSale,
      reviews,
      addReview,
      deleteReview,
      users,
      addUser,
      updateUser,
      deleteUser,
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      stats: {
        totalRevenue,
        totalOrders,
        activeInventory,
        totalItemsSold
      }
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
}
