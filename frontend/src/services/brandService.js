import api from './api';

const brandService = {
  getAllBrands: async () => {
    const response = await api.get('thuong-hieu');
    if (response.data && response.data.code === 200) {
      return response.data.data;
    }
    return [];
  },

  getBrandById: async (id) => {
    const response = await api.get(`thuong-hieu/${id}`);
    if (response.data && response.data.code === 200) {
      return response.data.data;
    }
    return null;
  },

  createBrand: async (data) => {
    const response = await api.post('thuong-hieu', data);
    return response.data;
  },

  updateBrand: async (id, data) => {
    const response = await api.put(`thuong-hieu/${id}`, data);
    return response.data;
  },

  deleteBrand: async (id) => {
    const response = await api.delete(`thuong-hieu/${id}`);
    return response.data;
  }
};

export default brandService;
