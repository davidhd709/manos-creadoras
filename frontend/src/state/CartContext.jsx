import { createContext, useContext, useState, useEffect } from 'react';

const CartCtx = createContext();

const STORAGE_KEY = 'manos_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.product._id === product._id);
      if (existing) {
        return prev.map((p) =>
          p.product._id === product._id ? { ...p, quantity: p.quantity + quantity } : p,
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const remove = (id) => setItems((prev) => prev.filter((p) => p.product._id !== id));

  const clear = () => setItems([]);

  const total = items.reduce(
    (sum, i) => sum + (i.product.isPromotion ? i.product.promotionPrice : i.product.price) * i.quantity,
    0,
  );

  return <CartCtx.Provider value={{ items, add, remove, clear, total }}>{children}</CartCtx.Provider>;
};

export const useCart = () => useContext(CartCtx);
