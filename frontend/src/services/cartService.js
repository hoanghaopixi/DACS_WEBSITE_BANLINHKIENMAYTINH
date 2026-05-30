import api from './api';
import authService from './authService';

const unwrapCart = (response, fallbackMessage) => {
  const payload = response?.data;
  if (!payload || payload.code !== 200 || !payload.data) {
    throw new Error(fallbackMessage);
  }
  return payload.data;
};

const getCustomerId = () => {
  const user = authService.getStoredUser();
  return user?.maKH || null;
};

const cartService = {
  getCart: async () => {
    const maKH = getCustomerId();
    if (maKH) {
      const response = await api.get(`cart/khach-hang/${maKH}`);
      return unwrapCart(response, 'Không thể tải giỏ hàng.');
    }
    // Guest fallback
    const response = await api.get('cart');
    return unwrapCart(response, 'Không thể tải giỏ hàng.');
  },

  addToCart: async (productId, quantity = 1) => {
    const maKH = getCustomerId();
    if (maKH) {
      const response = await api.post(`cart/khach-hang/${maKH}/items`, { productId, quantity });
      return unwrapCart(response, 'Không thể thêm vào giỏ hàng.');
    }
    const response = await api.post('cart/items', { productId, quantity });
    return unwrapCart(response, 'Không thể thêm vào giỏ hàng.');
  },

  updateCartItem: async (productId, quantity) => {
    const maKH = getCustomerId();
    if (maKH) {
      const response = await api.put(`cart/khach-hang/${maKH}/items/${productId}`, { productId, quantity });
      return unwrapCart(response, 'Không thể cập nhật giỏ hàng.');
    }
    const response = await api.put(`cart/items/${productId}`, { productId, quantity });
    return unwrapCart(response, 'Không thể cập nhật giỏ hàng.');
  },

  removeCartItem: async (productId) => {
    const maKH = getCustomerId();
    if (maKH) {
      const response = await api.delete(`cart/khach-hang/${maKH}/items/${productId}`);
      return unwrapCart(response, 'Không thể xóa sản phẩm khỏi giỏ hàng.');
    }
    const response = await api.delete(`cart/items/${productId}`);
    return unwrapCart(response, 'Không thể xóa sản phẩm khỏi giỏ hàng.');
  },

  clearCart: async () => {
    const maKH = getCustomerId();
    if (maKH) {
      const response = await api.delete(`cart/khach-hang/${maKH}`);
      return unwrapCart(response, 'Không thể xóa giỏ hàng.');
    }
    const response = await api.delete('cart');
    return unwrapCart(response, 'Không thể xóa giỏ hàng.');
  },
};

export default cartService;
