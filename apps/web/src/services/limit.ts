import api from './api';

export const limitApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/limits', { params }),
  getByEnterprise: (enterpriseId: string) =>
    api.get(`/limits/${enterpriseId}`),
  calculate: (enterpriseId: string) =>
    api.post(`/limits/${enterpriseId}/calculate`),
  adjust: (enterpriseId: string, data: { newLimit: number; reason: string }) =>
    api.post(`/limits/${enterpriseId}/adjust`, data),
  getHistory: (enterpriseId: string) =>
    api.get(`/limits/${enterpriseId}/history`),
};
