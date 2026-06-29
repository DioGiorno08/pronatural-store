import { createContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
export const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const addItem = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) {
        toast.success(`${product.name} actualizado en el carrito`);
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast.success(`${product.name} añadido al carrito`);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);
  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.error('Producto eliminado del carrito');
  }, []);
  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);
  const clearCart = useCallback(() => {
    setItems([]);
    toast.success('Carrito vaciado');
  }, []);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};
