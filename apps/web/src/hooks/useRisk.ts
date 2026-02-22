import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { riskApi } from '../services/risk';

export function useRiskEventList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['risk-events', params],
    queryFn: () => riskApi.listEvents(params),
  });
}

export function useRiskEventDetail(id: string) {
  return useQuery({
    queryKey: ['risk-events', id],
    queryFn: () => riskApi.getEvent(id),
    enabled: !!id,
  });
}

export function useHandleRiskEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status: string; handleNote?: string }) =>
      riskApi.handleEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-events'] });
      message.success('Risk event updated');
    },
    onError: (err: any) => message.error(err?.message || 'Failed to handle event'),
  });
}

export function useRiskRules() {
  return useQuery({
    queryKey: ['risk-rules'],
    queryFn: () => riskApi.getRules(),
  });
}
