import api from './api';

const orderService = {
  getAllOrders: async () => {
    const response = await api.get('don-hang');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`don-hang/${id}`);
    return response.data;
  },

  updateOrder: async (id, orderData) => {
    const response = await api.put(`don-hang/${id}`, orderData);
    return response.data;
  },

  createManualOrder: async (orderData) => {
    try {
      const response = await api.post('/don-hang/manual', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`don-hang/${id}`);
    return response.data;
  }
};

export default orderService;
