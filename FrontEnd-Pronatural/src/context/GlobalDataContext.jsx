import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { api } from '../utils/api';

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const GlobalDataContext = createContext();
export function useGlobalData() {
  return useContext(GlobalDataContext);
}

export function GlobalDataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]); // This will now hold our Empleados from MongoDB
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // Cargar datos reales del backend al iniciar
    const fetchAllData = async () => {
      try {
        const token = Cookies.get('authCookie');
        const decoded = token ? decodeJwt(token) : null;
        const isAdmin = decoded?.userType === 'Admin' || decoded?.userType === 'Employee';
        
        const [apiProducts, apiSales, apiCategories, apiEmployees, apiCustomers, apiReviews] = await Promise.all([
          api.getProducts().catch(e => { return []; }),
          isAdmin ? api.getSales().catch(e => { return []; }) : Promise.resolve([]),
          api.getCategories().catch(e => { return []; }),
          isAdmin ? api.getEmployees().catch(e => { return []; }) : Promise.resolve([]),
          isAdmin ? api.getClientes().catch(e => { return []; }) : Promise.resolve([]),
          api.getReviews().catch(e => { return []; })
        ]);
        setProducts(Array.isArray(apiProducts) ? apiProducts : []);
        setSales(Array.isArray(apiSales) ? apiSales : []);
        setCategories(Array.isArray(apiCategories) ? apiCategories : []);
        setUsers(Array.isArray(apiEmployees) ? apiEmployees : []);
        setCustomers(Array.isArray(apiCustomers) ? apiCustomers : []);
        setReviews(Array.isArray(apiReviews) ? apiReviews : []);
      } catch (error) {
        console.error("Error loading data from backend:", error);
      }
    };
    fetchAllData();
  }, []);

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
      // Pass the full category object (with nombre, tipo, cantidad, descripcion)
      const res = await api.createCategory(category);
      setCategories(prev => [...prev, res.category || res.data || res]);
    } catch (e) {
      console.error("Error adding category:", e);
      setCategories(prev => [...prev, category]);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => (c.id !== id && c._id !== id)));
    } catch (e) {
      console.error("Error deleting category:", e);
      setCategories(prev => prev.filter(c => (c.id !== id && c._id !== id)));
    }
  };

  const updateCategory = async (id, updatedData) => {
    try {
      const res = await api.updateCategory(id, updatedData);
      setCategories(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, ...(res.category || res.data || res) } : c));
    } catch (e) {
      console.error("Error updating category:", e);
      setCategories(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, ...updatedData } : c));
    }
  };
  const addSale = async (saleData) => {
    try {
      // Aceptar tanto saleData.items como saleData.products
      const rawItems = saleData.items || saleData.products || [];

      // Formatear datos para el backend
      const formattedSale = {
        customerId: saleData.customerId ?? (saleData.client !== 'Cliente General' ? saleData.client : null),
        products: rawItems.map(item => ({
          productId: item.productId || item.id || item._id,
          quantity: item.quantity
        })),
        total: saleData.total || saleData.amount || 0,
        paymentMethod: saleData.paymentMethod,
        status: saleData.status || "Completado",
        notes: saleData.notes || ""
      };

      const savedSale = await api.createSale(formattedSale);

      // Descontar inventario localmente para UI instántanea
      const items = saleData.items || [];
      let newProducts = [...products];
      items.forEach(item => {
        const pIdx = newProducts.findIndex(p => p.id === item.id || p._id === item.id);
        if (pIdx >= 0) {
          newProducts[pIdx] = { ...newProducts[pIdx], stock: Math.max(0, newProducts[pIdx].stock - item.quantity) };
        }
      });
      setProducts(newProducts);
      
      setSales(prev => [savedSale, ...prev]);
      return savedSale;
    } catch (e) {
      console.error("Error creating sale:", e);
      throw e;
    }
  };

  const sendInvoice = async (saleId) => {
    try {
      await api.sendInvoice(saleId);
    } catch (e) {
      console.error("Error sending invoice:", e);
      throw e;
    }
  };

  const updateSaleStatus = async (id, status) => {
    try {
      const updated = await api.updateSaleStatus(id, status);
      setSales(prev => prev.map(s => (s.id === id || s._id === id) ? { ...s, ...updated } : s));
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const deleteSale = async (id) => {
    try {
      await api.deleteSale(id);
      setSales(prev => prev.filter(s => s.id !== id && s._id !== id));
    } catch(e) {
      console.error("Error deleting sale:", e);
      // Fallback local UI delete if error
      setSales(prev => prev.filter(s => s.id !== id && s._id !== id));
    }
  };
  const addReview = async (review) => {
    try {
      const res = await api.createReview(review);
      setReviews(prev => [res.review || res, ...prev]);
    } catch(e) {
      console.error(e);
      throw e;
    }
  };
  const deleteReview = async (id) => {
    try {
      await api.deleteReview(id);
      setReviews(prev => prev.filter(r => r._id !== id && r.id !== id));
    } catch(e) {
      console.error(e);
      throw e;
    }
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
  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.total || curr.amount || 0), 0);
  const totalOrders = sales.length;
  const activeInventory = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  const totalItemsSold = sales.reduce((acc, curr) => {
    if (Array.isArray(curr.products)) {
      return acc + curr.products.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
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
      updateSaleStatus,
      sendInvoice,
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
