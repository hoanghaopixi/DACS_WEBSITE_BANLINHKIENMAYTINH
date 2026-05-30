import api from './api';

const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('danh-muc');
    const payload = response.data;

    if (!payload || payload.code !== 200 || !Array.isArray(payload.data)) {
      throw new Error('Không thể tải danh mục.');
    }

    return payload.data.map((item) => ({
      id: item.maDanhMuc,
      name: item.tenDanhMuc,
      description: item.moTa || '',
    }));
  },
};

export default categoryService;
