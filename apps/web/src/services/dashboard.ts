import api from './api';

export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),
  getTrend: () => api.get('/dashboard/trend'),
  getRiskOverview: () => api.get('/dashboard/risk-overview'),
  getRecentAlerts: () => api.get('/dashboard/recent-alerts'),
  getKpiDetail: (metric: string, page = 1, pageSize = 20) =>
    api.get(`/dashboard/kpi/${metric}`, { params: { page, pageSize } }),
};
