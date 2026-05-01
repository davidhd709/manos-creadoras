import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api';

const CartCtx = createContext();

const STORAGE_KEY = 'manos_cart';
const STORAGE_VERSION = 2;

function loadInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed.filter((i) => i?.product?._id && i.quantity > 0);
    }
    if (parsed && parsed.version === STORAGE_VERSION && Array.isArray(parsed.items)) {
      return parsed.items.filter((i) => i?.product?._id && i.quantity > 0);
    }
    return [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function unitPrice(product) {
  if (!product) return 0;
  if (product.isPromotion && product.promotionPrice != null) return product.promotionPrice;
  return product.price || 0;
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadInitial);
  const [revalidating, setRevalidating] = useState(false);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, items, savedAt: Date.now() }),
      );
    } catch {
      // localStorage lleno o deshabilitado: ignorar silenciosamente
    }
  }, [items]);

  const add = (product, quantity = 1) => {
    if (!product || product.stock <= 0) return;
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

  const clear = () => {
    setItems([]);
    setWarnings([]);
  };

  const dismissWarning = (productId) => {
    setWarnings((prev) => prev.filter((w) => w.productId !== productId));
  };

  const revalidate = useCallback(async () => {
    if (items.length === 0) return { changed: false, warnings: [] };
    setRevalidating(true);
    try {
      const fresh = await Promise.all(
        items.map((i) =>
          api
            .get(`/products/${i.product._id}`)
            .then(({ data }) => ({ id: i.product._id, product: data, error: null }))
            .catch((err) => ({ id: i.product._id, product: null, error: err })),
        ),
      );
      const newWarnings = [];
      const nextItems = [];
      items.forEach((current) => {
        const found = fresh.find((f) => f.id === current.product._id);
        if (!found) return;
        if (found.error || !found.product) {
          newWarnings.push({
            productId: current.product._id,
            type: 'unavailable',
            title: current.product.title,
            message: 'Este producto ya no está disponible. Lo retiramos de tu carrito.',
          });
          return;
        }
        const fp = found.product;
        if (fp.stock <= 0) {
          newWarnings.push({
            productId: current.product._id,
            type: 'out_of_stock',
            title: fp.title,
            message: 'Se agotó este producto. Lo retiramos de tu carrito.',
          });
          return;
        }
        let qty = current.quantity;
        if (qty > fp.stock) {
          newWarnings.push({
            productId: current.product._id,
            type: 'reduced',
            title: fp.title,
            message: `Ajustamos la cantidad a ${fp.stock} (era el último stock disponible).`,
          });
          qty = fp.stock;
        }
        const oldUnit = unitPrice(current.product);
        const newUnit = unitPrice(fp);
        if (oldUnit !== newUnit) {
          newWarnings.push({
            productId: current.product._id,
            type: 'price_change',
            title: fp.title,
            message:
              newUnit < oldUnit
                ? '¡Bajó de precio! Actualizamos el valor en tu carrito.'
                : 'Cambió el precio. Actualizamos el valor en tu carrito.',
          });
        }
        nextItems.push({ product: fp, quantity: qty });
      });
      setItems(nextItems);
      setWarnings(newWarnings);
      return { changed: newWarnings.length > 0, warnings: newWarnings };
    } finally {
      setRevalidating(false);
    }
  }, [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + unitPrice(i.product) * i.quantity, 0),
    [items],
  );

  const savings = useMemo(
    () =>
      items.reduce((sum, i) => {
        if (!i.product.isPromotion || i.product.promotionPrice == null) return sum;
        const diff = (i.product.price || 0) - i.product.promotionPrice;
        return sum + Math.max(0, diff) * i.quantity;
      }, 0),
    [items],
  );

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const value = {
    items,
    add,
    updateQuantity,
    remove,
    clear,
    revalidate,
    revalidating,
    warnings,
    dismissWarning,
    subtotal,
    savings,
    count,
    total: subtotal,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
};

export const useCart = () => useContext(CartCtx);
