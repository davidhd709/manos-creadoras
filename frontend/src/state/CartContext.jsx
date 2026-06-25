import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartCtx = createContext();

const STORAGE_KEY = 'manos_cart';
const STORAGE_VERSION = 2;

function loadInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) return parsed.filter((i) => i?.product?._id && i.quantity > 0);
    if (parsed?.version === STORAGE_VERSION && Array.isArray(parsed.items))
      return parsed.items.filter((i) => i?.product?._id && i.quantity > 0);
    return [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function normalizeProduct(p) {
  if (!p) return p;
  return { ...p, _id: p._id || p.id };
}

function normalizeServerItems(serverItems) {
  return (serverItems || []).map(({ product, quantity }) => ({
    product: normalizeProduct(product),
    quantity,
  }));
}

function unitPrice(product) {
  if (!product) return 0;
  if (product.isPromotion && product.promotionPrice != null) return product.promotionPrice;
  return product.price || 0;
}

function pid(product) {
  return product?.id || product?._id;
}

export const CartProvider = ({ children }) => {
  const { user, authLoading } = useAuth();
  const [items, setItems] = useState(loadInitial);
  const [revalidating, setRevalidating] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const initializedRef = useRef(false);
  const itemsRef = useRef(items);

  useEffect(() => { itemsRef.current = items; }, [items]);

  // Persist to localStorage only for anonymous users
  useEffect(() => {
    if (user) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, items, savedAt: Date.now() }),
      );
    } catch {}
  }, [items, user]);

  // Sync with backend when auth state changes
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      if (initializedRef.current) {
        // Just logged out: clear local state (server keeps cart for next login)
        initializedRef.current = false;
        setItems([]);
        setWarnings([]);
      }
      // Anonymous: items already loaded from localStorage via useState(loadInitial)
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    // Authenticated: sync localStorage items → backend, then load from backend
    const localItems = loadInitial();
    const syncPayload = localItems
      .map((i) => ({ productId: pid(i.product), quantity: i.quantity }))
      .filter((x) => x.productId);

    (async () => {
      if (syncPayload.length > 0) {
        try {
          await api.post('/cart/sync', { items: syncPayload });
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore sync failure, still fetch server cart
        }
      }
      const { data } = await api.get('/cart');
      setItems(normalizeServerItems(data.items));
    })().catch(() => {});
  }, [authLoading, user]);

  const add = useCallback(
    (product, quantity = 1) => {
      if (!product || product.stock <= 0) return;
      const productPid = pid(product);
      const normalizedProduct = normalizeProduct(product);
      const current = itemsRef.current.find((p) => pid(p.product) === productPid);
      const newQty = current
        ? Math.min(current.quantity + quantity, product.stock)
        : Math.min(quantity, product.stock);

      setItems((prev) => {
        if (current) {
          return prev.map((p) =>
            pid(p.product) === productPid
              ? { ...p, quantity: newQty, product: normalizedProduct }
              : p,
          );
        }
        return [...prev, { product: normalizedProduct, quantity: newQty }];
      });

      if (user) {
        api.put('/cart/items', { productId: productPid, quantity: newQty }).catch(() => {});
      }
    },
    [user],
  );

  const updateQuantity = useCallback(
    (productId, newQuantity) => {
      if (newQuantity <= 0) {
        remove(productId);
        return;
      }
      const item = itemsRef.current.find((i) => pid(i.product) === productId);
      const clampedQty = Math.min(newQuantity, item?.product.stock || 999);

      setItems((prev) =>
        prev.map((i) =>
          pid(i.product) === productId ? { ...i, quantity: clampedQty } : i,
        ),
      );

      if (user) {
        api.put('/cart/items', { productId, quantity: clampedQty }).catch(() => {});
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const remove = useCallback(
    (productId) => {
      setItems((prev) => prev.filter((p) => pid(p.product) !== productId));
      if (user) {
        api.delete(`/cart/items/${productId}`).catch(() => {});
      }
    },
    [user],
  );

  const clear = useCallback(() => {
    setItems([]);
    setWarnings([]);
    if (user) {
      api.delete('/cart').catch(() => {});
    }
  }, [user]);

  const dismissWarning = useCallback((productId) => {
    setWarnings((prev) => prev.filter((w) => w.productId !== productId));
  }, []);

  const revalidate = useCallback(async () => {
    const currentItems = itemsRef.current;
    if (currentItems.length === 0) return { changed: false, warnings: [] };
    setRevalidating(true);
    try {
      const fresh = await Promise.all(
        currentItems.map((i) =>
          api
            .get(`/products/${pid(i.product)}`)
            .then(({ data }) => ({ id: pid(i.product), product: data, error: null }))
            .catch((err) => ({ id: pid(i.product), product: null, error: err })),
        ),
      );
      const newWarnings = [];
      const nextItems = [];
      currentItems.forEach((current) => {
        const currentPid = pid(current.product);
        const found = fresh.find((f) => f.id === currentPid);
        if (!found) return;
        if (found.error || !found.product) {
          newWarnings.push({
            productId: currentPid,
            type: 'unavailable',
            title: current.product.title,
            message: 'Este producto ya no está disponible. Lo retiramos de tu carrito.',
          });
          return;
        }
        const fp = found.product;
        if (fp.stock <= 0) {
          newWarnings.push({
            productId: currentPid,
            type: 'out_of_stock',
            title: fp.title,
            message: 'Se agotó este producto. Lo retiramos de tu carrito.',
          });
          return;
        }
        let qty = current.quantity;
        if (qty > fp.stock) {
          newWarnings.push({
            productId: currentPid,
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
            productId: currentPid,
            type: 'price_change',
            title: fp.title,
            message:
              newUnit < oldUnit
                ? '¡Bajó de precio! Actualizamos el valor en tu carrito.'
                : 'Cambió el precio. Actualizamos el valor en tu carrito.',
          });
        }
        nextItems.push({ product: normalizeProduct(fp), quantity: qty });
      });
      setItems(nextItems);
      setWarnings(newWarnings);
      return { changed: newWarnings.length > 0, warnings: newWarnings };
    } finally {
      setRevalidating(false);
    }
  }, []);

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

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

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
