import api from './api';

const dashboardService = {
  getStats: async () => {
    const response = await api.get('thong-ke/tong-quan');
    return response.data;
  }
};

export default dashboardService;
