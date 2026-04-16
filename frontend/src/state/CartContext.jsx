import { createContext, useContext, useState, useEffect } from 'react';

const CartCtx = createContext();

const STORAGE_KEY = 'manos_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.filter((i) => i.product && i.quantity > 0);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, quantity = 1) => {
    if (product.stock <= 0) return;
    setItems((prev) => {
      const existing = prev.find((p) => p.product._id === product._id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((p) =>
          p.product._id === product._id ? { ...p, quantity: newQty, product } : p,
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      remove(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product._id === productId
          ? { ...i, quantity: Math.min(newQuantity, i.product.stock || 999) }
          : i,
      ),
    );
  };

  const remove = (id) => setItems((prev) => prev.filter((p) => p.product._id !== id));

  const clear = () => setItems([]);

  const total = items.reduce(
    (sum, i) => sum + (i.product.isPromotion ? i.product.promotionPrice : i.product.price) * i.quantity,
    0,
  );

  return <CartCtx.Provider value={{ items, add, updateQuantity, remove, clear, total }}>{children}</CartCtx.Provider>;
};

export const useCart = () => useContext(CartCtx);
