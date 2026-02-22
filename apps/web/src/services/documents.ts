import api from './api';

export const documentsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/documents', { params }),
  getById: (id: string) =>
    api.get(`/documents/${id}`),
  upload: (formData: FormData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  extract: (id: string) =>
    api.post(`/documents/${id}/extract`),
  match: (data: { contractId: string; invoiceId: string; logisticsId: string }) =>
    api.post('/documents/match', data),
};
