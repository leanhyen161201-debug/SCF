import api from './api';

export const creditApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/credits', { params }),
  getById: (id: string) =>
    api.get(`/credits/${id}`),
  create: (data: { enterpriseId: string; requestedAmount: number }) =>
    api.post('/credits', data),
  review: (id: string, data: { status: string; approvedAmount?: number; reviewNote?: string }) =>
    api.put(`/credits/${id}/review`, data),
  cancel: (id: string) =>
    api.put(`/credits/${id}/cancel`),
};
