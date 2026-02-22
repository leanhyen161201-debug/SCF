import { create } from 'zustand';
import type { User } from '@scf/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('scf_user') || 'null'),
  token: localStorage.getItem('scf_token'),
  refreshToken: localStorage.getItem('scf_refresh_token'),
  isAuthenticated: !!localStorage.getItem('scf_token'),

  login: (user, token, refreshToken) => {
    localStorage.setItem('scf_user', JSON.stringify(user));
    localStorage.setItem('scf_token', token);
    localStorage.setItem('scf_refresh_token', refreshToken);
    set({ user, token, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('scf_user');
    localStorage.removeItem('scf_token');
    localStorage.removeItem('scf_refresh_token');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  setToken: (token) => {
    localStorage.setItem('scf_token', token);
    set({ token });
  },
}));
