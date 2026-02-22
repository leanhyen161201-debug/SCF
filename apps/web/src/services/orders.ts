import api from './api';

export const ordersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/orders', { params }),
  getById: (id: string) =>
    api.get(`/orders/${id}`),
  create: (data: { enterpriseId: string; amount: number; dueDate?: string }) =>
    api.post('/orders', data),
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
  applyFinancing: (id: string, amount: number) =>
    api.post(`/orders/${id}/financing`, { amount }),
};
