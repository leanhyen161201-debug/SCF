export interface KpiData {
  totalCredit: number;
  pendingApplications: number;
  activeOrders: number;
  overdueOrders: number;
  riskEvents: number;
  creditUtilization: number;
  matchSuccessRate: number;
  totalFinancingAmount: number;
}

export interface KpiCard {
  key: string;
  label: string;
  value: number;
  previousValue?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'flat';
  unit?: string;
  color?: string;
}

export interface TrendData {
  month: string;
  value: number;
  category?: string;
}

export interface RiskOverviewData {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface RecentAlert {
  id: string;
  eventNo: string;
  enterpriseName: string;
  type: string;
  severity: string;
  description: string;
  createdAt: string;
}

export interface DrilldownParams {
  metric: string;
  filters?: Record<string, string>;
}
