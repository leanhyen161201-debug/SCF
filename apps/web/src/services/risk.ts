import api from './api';

export const riskApi = {
  listEvents: (params?: Record<string, unknown>) =>
    api.get('/risk/events', { params }),
  getEvent: (id: string) =>
    api.get(`/risk/events/${id}`),
  handleEvent: (id: string, data: { status: string; handleNote?: string }) =>
    api.put(`/risk/events/${id}/handle`, data),
  getRules: () =>
    api.get('/risk/rules'),
  triggerOverdueScan: () =>
    api.post('/risk/scan/overdue'),
  triggerReturnRateScan: () =>
    api.post('/risk/scan/return-rate'),
};
