import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { limitApi } from '../services/limit';

export function useLimitList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['limits', params],
    queryFn: () => limitApi.list(params),
  });
}

export function useLimitDetail(enterpriseId: string) {
  return useQuery({
    queryKey: ['limits', enterpriseId],
    queryFn: () => limitApi.getByEnterprise(enterpriseId),
    enabled: !!enterpriseId,
  });
}

export function useCalculateLimit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: limitApi.calculate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['limits'] });
      message.success('Credit limit recalculated');
    },
    onError: (err: any) => message.error(err?.message || 'Calculation failed'),
  });
}

export function useAdjustLimit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enterpriseId, ...data }: { enterpriseId: string; newLimit: number; reason: string }) =>
      limitApi.adjust(enterpriseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['limits'] });
      message.success('Limit adjusted');
    },
    onError: (err: any) => message.error(err?.message || 'Adjustment failed'),
  });
}

export function useLimitHistory(enterpriseId: string) {
  return useQuery({
    queryKey: ['limits', enterpriseId, 'history'],
    queryFn: () => limitApi.getHistory(enterpriseId),
    enabled: !!enterpriseId,
  });
}
