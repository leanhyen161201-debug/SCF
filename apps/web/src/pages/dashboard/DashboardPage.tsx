import { Row, Col, Spin, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardOverview,
  useDashboardTrend,
  useRiskOverview,
  useRecentAlerts,
} from '@/hooks/useDashboard';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format';
import PageHeader from '@/components/PageHeader';
import KpiCard from './components/KpiCard';
import TrendChart from './components/TrendChart';
import RiskOverview from './components/RiskOverview';
import RecentAlerts from './components/RecentAlerts';

interface KpiMetricConfig {
  key: string;
  title: string;
  format: (value: number) => string;
  prefix?: string;
}

const kpiMetrics: KpiMetricConfig[] = [
  { key: 'totalCredit', title: '总授信额度', format: formatCurrency },
  { key: 'pendingApplications', title: '待审申请', format: formatNumber },
  { key: 'activeOrders', title: '活跃订单', format: formatNumber },
  { key: 'overdueOrders', title: '逾期订单', format: formatNumber },
  { key: 'riskEvents', title: '风险事件', format: formatNumber },
  { key: 'creditUtilization', title: '授信使用率', format: formatPercent },
];

function getTrend(value: number, key: string): 'up' | 'down' | 'flat' {
  if (key === 'overdueOrders' || key === 'riskEvents') {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'flat';
  }
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useDashboardOverview();
  const { data: trendData, isLoading: trendLoading } = useDashboardTrend();
  const { data: riskData, isLoading: riskLoading } = useRiskOverview();
  const { data: alertsData, isLoading: alertsLoading } = useRecentAlerts();

  const overview = overviewData?.data;
  const trend = trendData?.data;
  const risk = riskData?.data;
  const alerts = alertsData?.data;

  if (overviewError) {
    return <Alert type="error" message="加载仪表盘数据失败" showIcon />;
  }

  return (
    <div>
      <PageHeader title="仪表盘" subtitle="业务数据概览" />

      {/* KPI Cards */}
      <Spin spinning={overviewLoading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {kpiMetrics.map((metric) => {
            const value = overview?.[metric.key] ?? 0;
            const trendValue = overview?.[`${metric.key}Trend`] ?? 0;

            return (
              <Col xs={24} sm={12} lg={8} key={metric.key}>
                <KpiCard
                  title={metric.title}
                  value={metric.format(value)}
                  trend={getTrend(trendValue, metric.key)}
                  onClick={() => navigate(`/dashboard/kpi/${metric.key}`)}
                />
              </Col>
            );
          })}
        </Row>
      </Spin>

      {/* Trend Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Spin spinning={trendLoading}>
            <TrendChart data={trend ?? []} />
          </Spin>
        </Col>
        <Col xs={24} lg={8}>
          <Spin spinning={riskLoading}>
            <RiskOverview
              data={risk ?? { critical: 0, high: 0, medium: 0, low: 0 }}
            />
          </Spin>
        </Col>
      </Row>

      {/* Recent Alerts */}
      <Spin spinning={alertsLoading}>
        <RecentAlerts alerts={alerts ?? []} />
      </Spin>
    </div>
  );
}
