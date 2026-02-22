import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { creditApi } from '../services/credit';

export function useCreditList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['credits', params],
    queryFn: () => creditApi.list(params),
  });
}

export function useCreditDetail(id: string) {
  return useQuery({
    queryKey: ['credits', id],
    queryFn: () => creditApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCredit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: creditApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      message.success('Credit application created');
    },
    onError: (err: any) => message.error(err?.message || 'Failed to create application'),
  });
}

export function useReviewCredit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status: string; approvedAmount?: number; reviewNote?: string }) =>
      creditApi.review(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      message.success('Review submitted');
    },
    onError: (err: any) => message.error(err?.message || 'Review failed'),
  });
}
