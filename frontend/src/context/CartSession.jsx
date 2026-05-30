import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import cartService from '../services/cartService';
import authService from '../services/authService';
import { FaCheckCircle } from 'react-icons/fa';
import '../components/CartToast.css';

const CartSessionContext = createContext(null);

let toastIdCounter = 0;

export function CartSessionProvider({ children }) {
  const [cart, setCart] = useState({
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const showCartToast = useCallback((productName, productImage) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, productName, productImage, exiting: false }]);
    // Auto dismiss after 3s
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 350);
    }, 3000);
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (e) {
      console.error('Lỗi tải giỏ hàng:', e);
      setCart({ items: [], totalQuantity: 0, totalAmount: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Listen for login/logout to refresh cart
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pc_store_auth_user') {
        refreshCart();
      }
    };
    const handleAuthChange = () => {
      refreshCart();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth_changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth_changed', handleAuthChange);
    };
  }, [refreshCart]);

  const value = useMemo(() => ({
    cart,
    isCartLoading: isLoading,
    refreshCart,
    addToCart: async (productId, quantity = 1, productInfo = {}) => {
      const data = await cartService.addToCart(productId, quantity);
      setCart(data);
      // Show toast
      showCartToast(productInfo.name || 'Sản phẩm', productInfo.image || '');
      return data;
    },
    updateCartItem: async (productId, quantity) => {
      const data = await cartService.updateCartItem(productId, quantity);
      setCart(data);
      return data;
    },
    removeCartItem: async (productId) => {
      const data = await cartService.removeCartItem(productId);
      setCart(data);
      return data;
    },
    clearCart: async () => {
      const data = await cartService.clearCart();
      setCart(data);
      return data;
    },
  }), [cart, isLoading, refreshCart, showCartToast]);

  return (
    <CartSessionContext.Provider value={value}>
      {children}
      {/* Cart Toast Notifications */}
      {toasts.length > 0 && (
        <div className="cart-toast-overlay">
          {toasts.map(t => (
            <div key={t.id} className={`cart-toast ${t.exiting ? 'exiting' : ''}`}>
              <div className="cart-toast-icon">
                <FaCheckCircle />
              </div>
              {t.productImage && (
                <img src={t.productImage} alt="" className="cart-toast-img" />
              )}
              <div className="cart-toast-body">
                <div className="cart-toast-title">
                  Đã thêm sản phẩm vào giỏ hàng
                </div>
                <div className="cart-toast-name">{t.productName}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CartSessionContext.Provider>
  );
}

export function useCartSession() {
  const context = useContext(CartSessionContext);
  if (!context) {
    throw new Error('useCartSession must be used within CartSessionProvider');
  }
  return context;
}
