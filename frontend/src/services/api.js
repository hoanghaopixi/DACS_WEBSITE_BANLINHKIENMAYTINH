import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log all requests
api.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem('pc_store_auth_user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user && user.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
      } catch (e) {}
    }
    const token = localStorage.getItem('pc_store_access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

// Log all responses & handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`📥 Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ Error: ${error.response?.status}`, error.response?.data);

    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Don't redirect on auth endpoints (avoid loop)
    const isAuthRequest = requestUrl.includes('auth/');

    if (status === 401 && !isAuthRequest) {
      // Xóa thông tin đăng nhập khi token hết hạn
      localStorage.removeItem('pc_store_auth_user');
      localStorage.removeItem('pc_store_access_token');
      window.dispatchEvent(new Event('auth_changed'));

      if (error.config && error.config.preventRedirect) {
         // Chỉ xóa auth, không tự động văng ra trang login để tránh làm phiền người dùng
         return Promise.reject(error);
      }

      // Văng ra trang login nếu là lỗi từ các request quan trọng khác
      window.location.href = '/login';
    }

    // 403 is NOT auto-redirected - let individual pages handle it
    // (AdminLayout already guards admin routes on the frontend side)

    return Promise.reject(error);
  }
);

export default api;
