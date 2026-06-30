import { createContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [initialized, setInitialized] = useState(false);

  // 1. Iniciar sesión de carrito y cargar desde DB
  useEffect(() => {
    let sid = localStorage.getItem('pronatural_session_id');
    if (!sid) {
      sid = 'cart_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('pronatural_session_id', sid);
    }
    setSessionId(sid);
    
    api.getCart(sid).then(data => {
       if (data && data.productos) {
         const mapped = data.productos
           .filter(p => p.productId) // Evitar productos nulos eliminados
           .map(p => ({
            id: p.productId._id,
            _id: p.productId._id,
            name: p.productId.nombreProducto || p.productId.name,
            price: p.productId.precio || p.productId.price || 0,
            image: p.productId.imagenProducto || p.productId.img || '',
            stock: p.productId.stock,
            quantity: p.quantity
         }));
         setItems(mapped);
       }
       setInitialized(true);
    }).catch(err => {
       console.error("Error loading cart", err);
       setInitialized(true);
    });
  }, []);

  // 2. Sincronizar automáticamente a DB cada vez que cambian los items
  useEffect(() => {
    if (!initialized || !sessionId) return;
    
    const timeout = setTimeout(() => {
      const payload = items.map(i => ({ productId: i._id || i.id, quantity: i.quantity }));
      api.syncCart(sessionId, payload).catch(e => console.error("Sync error", e));
    }, 800);

    return () => clearTimeout(timeout);
  }, [items, initialized, sessionId]);

  const addItem = useCallback((product) => {
    const exists = items.find((i) => (i.id === product.id || i._id === product._id));
    if (exists) {
      toast.success(`${product.name || product.nombreProducto} actualizado en el carrito`);
      setItems((prev) =>
        prev.map((i) =>
          (i.id === product.id || i._id === product._id) ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      toast.success(`${product.name || product.nombreProducto} añadido al carrito`);
      setItems((prev) => [...prev, { ...product, quantity: 1, id: product._id || product.id, name: product.nombreProducto || product.name, price: product.precio || product.price, image: product.imagenProducto || product.image }]);
    }
  }, [items]);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id && i._id !== id));
    toast.error('Producto eliminado del carrito');
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id || i._id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (sessionId) {
      api.clearCart(sessionId).catch(e => console.error(e));
    }
    toast.success('Carrito vaciado');
  }, [sessionId]);

  const totalItems = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
  const subtotal = items.reduce((acc, i) => acc + ((i.price || 0) * (i.quantity || 1)), 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};
