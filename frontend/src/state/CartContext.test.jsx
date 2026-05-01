import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

const mockProduct = {
  _id: 'p1',
  title: 'Vasija',
  price: 100,
  stock: 5,
  isPromotion: false,
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('should add a product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(mockProduct));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.total).toBe(100);
  });

  it('should increment quantity when adding same product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(mockProduct));
    act(() => result.current.add(mockProduct));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('should not exceed stock when adding', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add({ ...mockProduct, stock: 2 }));
    act(() => result.current.add({ ...mockProduct, stock: 2 }));
    act(() => result.current.add({ ...mockProduct, stock: 2 }));

    expect(result.current.items[0].quantity).toBe(2);
  });

  it('should not add out-of-stock product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add({ ...mockProduct, stock: 0 }));

    expect(result.current.items).toHaveLength(0);
  });

  it('should remove a product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(mockProduct));
    act(() => result.current.remove('p1'));

    expect(result.current.items).toHaveLength(0);
  });

  it('should update quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(mockProduct));
    act(() => result.current.updateQuantity('p1', 3));

    expect(result.current.items[0].quantity).toBe(3);
  });

  it('should remove item when updateQuantity to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(mockProduct));
    act(() => result.current.updateQuantity('p1', 0));

    expect(result.current.items).toHaveLength(0);
  });

  it('should clear all items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(mockProduct));
    act(() => result.current.add({ ...mockProduct, _id: 'p2' }));
    act(() => result.current.clear());

    expect(result.current.items).toHaveLength(0);
  });

  it('should calculate total with promotion price', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add({ ...mockProduct, isPromotion: true, promotionPrice: 80 }));

    expect(result.current.total).toBe(80);
  });

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(mockProduct));

    const stored = JSON.parse(localStorage.getItem('manos_cart'));
    expect(stored.items).toHaveLength(1);
    expect(stored.version).toBe(2);
  });

  it('should rehydrate legacy array format', () => {
    localStorage.setItem('manos_cart', JSON.stringify([{ product: mockProduct, quantity: 2 }]));
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('should compute savings when item is on promotion', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.add({ ...mockProduct, isPromotion: true, promotionPrice: 80 }, 2));
    expect(result.current.savings).toBe(40);
    expect(result.current.subtotal).toBe(160);
    expect(result.current.count).toBe(2);
  });
});
