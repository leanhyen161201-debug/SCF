import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { authApi } from '../services/auth';
import { useAuthStore } from '../stores/authStore';

export function useLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (res: any) => {
      const { accessToken, refreshToken, user } = res.data;
      login(user, accessToken, refreshToken);
      message.success('Login successful');
      navigate('/dashboard');
    },
    onError: (err: any) => {
      message.error(err?.message || 'Login failed');
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return () => {
    logout();
    navigate('/login');
  };
}
