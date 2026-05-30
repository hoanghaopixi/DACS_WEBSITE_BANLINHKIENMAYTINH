import api from './api';

const FALLBACK_IMAGE = 'https://via.placeholder.com/250x250?text=No+Image';

const normalizeProduct = (item) => {
  const originalPrice = Number(item.giaBan) || 0;
  const giaKM = Number(item.giaKM) || 0;
  
  let finalPrice = originalPrice;
  let hasDiscount = false;
  let discountPercent = 0;

  if (giaKM > 0) {
      finalPrice = giaKM;
      hasDiscount = true;
      if (originalPrice > 0) {
          discountPercent = Math.round(((originalPrice - giaKM) / originalPrice) * 100);
      }
  }

  return {
    id: item.maSP,
    name: item.tenSP,
    price: finalPrice, 
    originalPrice: originalPrice,
    hasDiscount: hasDiscount,
    discountPercent: discountPercent,
    priceIn: Number(item.giaNhap) || 0,
    soldQuantity: item.soLuongDaBan || 0,
    image: item.hinhAnh?.trim() || FALLBACK_IMAGE,
    mediaList: item.hinhAnhSanPhams || [],
    reviews: item.danhGias || [],
    reviewCount: item.reviewCount || 0,
    averageRating: item.averageRating || 0.0,
    category: item.danhMucTen || item.danhMuc?.tenDanhMuc || 'Khác',
    brand: item.thuongHieuTen || item.thuongHieu?.tenThuongHieu || '',
    maDanhMuc: item.maDanhMuc || item.danhMuc?.maDanhMuc || '',
    maThuongHieu: item.maThuongHieu || item.thuongHieu?.maThuongHieu || '',
    stock: item.soLuongTon ?? 0,
    minStock: item.tonToiThieu ?? 5,
    warranty: item.baoHanh ?? 0,
    description: item.moTa?.trim() || 'Đang cập nhật...'
  };
};

const productService = {
  getAllProducts: async () => {
    const response = await api.get('san-pham');
    const payload = response.data;

    if (!payload || payload.code !== 200 || !Array.isArray(payload.data)) {
      throw new Error('Dữ liệu sản phẩm trả về không hợp lệ.');
    }

    return payload.data.map(normalizeProduct);
  },

  getProductById: async (id) => {
    const response = await api.get(`san-pham/${id}`);
    const payload = response.data;

    if (!payload || payload.code !== 200 || !payload.data) {
      throw new Error('Không tìm thấy chi tiết sản phẩm.');
    }

    return normalizeProduct(payload.data);
  },

  searchProducts: async (keyword) => {
    const response = await api.get('san-pham', {
      params: { keyword },
    });
    const payload = response.data;

    if (!payload || payload.code !== 200 || !Array.isArray(payload.data)) {
      throw new Error('Không thể tìm kiếm sản phẩm.');
    }

    return payload.data.map(normalizeProduct);
  },

  getSuggestions: async (limit = 6) => {
    const response = await api.get('/san-pham/goi-y', {
      params: { limit },
    });
    const payload = response.data;

    if (!payload || payload.code !== 200 || !Array.isArray(payload.data)) {
      throw new Error('Không thể tải gợi ý sản phẩm.');
    }

    return payload.data.map(normalizeProduct);
  },

  getBestSellingByCategory: async (category, limit = 5) => {
    try {
      const response = await api.get(`/san-pham/ban-chay?category=${encodeURIComponent(category)}&limit=${limit}`);
      return response.data.data.map(normalizeProduct);
    } catch (error) {
      console.error('Error fetching best selling products by category:', error);
      throw error;
    }
  },

  createProduct: async (productData) => {
    const response = await api.post('san-pham', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`san-pham/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`san-pham/${id}`);
    return response.data;
  },
};

export default productService;
