import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/dashboard';

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApi.getOverview(),
  });
}

export function useDashboardTrend() {
  return useQuery({
    queryKey: ['dashboard', 'trend'],
    queryFn: () => dashboardApi.getTrend(),
  });
}

export function useRiskOverview() {
  return useQuery({
    queryKey: ['dashboard', 'risk-overview'],
    queryFn: () => dashboardApi.getRiskOverview(),
  });
}

export function useRecentAlerts() {
  return useQuery({
    queryKey: ['dashboard', 'recent-alerts'],
    queryFn: () => dashboardApi.getRecentAlerts(),
  });
}

export function useKpiDetail(metric: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['dashboard', 'kpi', metric, page, pageSize],
    queryFn: () => dashboardApi.getKpiDetail(metric, page, pageSize),
    enabled: !!metric,
  });
}
