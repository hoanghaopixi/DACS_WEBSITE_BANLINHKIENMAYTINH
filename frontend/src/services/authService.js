import api from './api';

const AUTH_STORAGE_KEY = 'pc_store_auth_user';

const unwrapResponse = (response, fallbackMessage) => {
  const payload = response?.data;

  if (!payload || !payload.code || !payload.data) {
    throw new Error(fallbackMessage);
  }

  return payload.data;
};

const mergeGuestCart = async (user) => {
  if (!user || !user.maKH) return;
  try {
    const res = await api.get('cart');
    const guestCart = res.data?.data;
    if (guestCart && guestCart.items && guestCart.items.length > 0) {
      for (const item of guestCart.items) {
        await api.post(`cart/khach-hang/${user.maKH}/items`, {
          productId: item.productId,
          quantity: item.quantity
        });
      }
      await api.delete('cart');
    }
  } catch (e) {
    console.error('Lỗi khi merge giỏ hàng:', e);
  }
};

const saveAuthUser = async (user) => {
  await mergeGuestCart(user);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('auth_changed'));
  return user;
};

const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('auth/login', credentials);
      return await saveAuthUser(unwrapResponse(response, 'Đăng nhập thất bại.'));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại.');
    }
  },

  register: async (payload) => {
    try {
      const response = await api.post('auth/register', payload);
      return await saveAuthUser(unwrapResponse(response, 'Đăng ký thất bại.'));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại.');
    }
  },

  requestOtp: async (identifier) => {
    try {
      const response = await api.post('auth/otp/request', { identifier });
      return unwrapResponse(response, 'Không thể gửi OTP.');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể gửi OTP.');
    }
  },

  loginWithOtp: async (identifier, otp) => {
    try {
      const response = await api.post('auth/otp/login', { identifier, otp });
      return await saveAuthUser(unwrapResponse(response, 'Đăng nhập OTP thất bại.'));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Đăng nhập OTP thất bại.');
    }
  },

  loginWithGoogle: async (email) => {
    try {
      const response = await api.post('auth/google', { email });
      return await saveAuthUser(unwrapResponse(response, 'Đăng nhập Google thất bại.'));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Đăng nhập Google thất bại.');
    }
  },

  fetchCurrentUser: async (token) => {
    try {
      const response = await api.get('auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const user = unwrapResponse(response, 'Không thể lấy thông tin người dùng.');
      // Keep the token in the user object or store it separately
      user.accessToken = token;
      return await saveAuthUser(user);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng.');
    }
  },

  getStoredUser: () => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('pc_store_access_token');
    window.dispatchEvent(new Event('auth_changed'));
    // Fire and forget: clear the guest cart on the backend
    api.delete('cart').catch(() => {});
  },

  isAdmin: () => {
    const user = authService.getStoredUser();
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.toUpperCase() === 'ADMIN');
  },
};

export default authService;
