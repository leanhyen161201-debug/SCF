import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { ordersApi } from '../services/orders';

export function useOrderList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.list(params),
  });
}

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      message.success('Order created');
    },
    onError: (err: any) => message.error(err?.message || 'Failed to create order'),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      message.success('Order status updated');
    },
    onError: (err: any) => message.error(err?.message || 'Failed to update status'),
  });
}
