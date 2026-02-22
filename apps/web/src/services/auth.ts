import api from './api';

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};
