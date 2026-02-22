import { Card, Descriptions, Tag, Typography } from 'antd';
import { formatCurrency, formatPercent } from '@/utils/format';
import type { FlowAnalysis } from '@scf/shared';

interface LimitCalculatorProps {
  calculationData?: FlowAnalysis;
  totalLimit: number;
}

export default function LimitCalculator({ calculationData, totalLimit }: LimitCalculatorProps) {
  if (!calculationData) {
    return (
      <Card title="Calculation Breakdown">
        <Typography.Text type="secondary">No calculation data available</Typography.Text>
      </Card>
    );
  }

  return (
    <Card title="Credit Limit Calculation Breakdown">
      <Typography.Title level={5} className="mb-4">
        Formula: CreditLimit = BaseAmount x FlowScore x RiskMultiplier x IndustryFactor
      </Typography.Title>

      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Final Limit">
          <Typography.Text strong className="text-lg">
            {formatCurrency(totalLimit)}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Avg Monthly Volume">
          {formatCurrency(calculationData.avgMonthlyVolume)}
        </Descriptions.Item>
        <Descriptions.Item label="Transaction Count (90d)">
          {calculationData.transactionCount}
        </Descriptions.Item>
        <Descriptions.Item label="Growth Rate">
          <Tag color={calculationData.growthRate >= 0 ? 'green' : 'red'}>
            {formatPercent(calculationData.growthRate)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Overdue Rate">
          <Tag color={calculationData.overdueRate > 0.05 ? 'red' : 'green'}>
            {formatPercent(calculationData.overdueRate)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Return Rate">
          <Tag color={calculationData.returnRate > 0.15 ? 'red' : 'green'}>
            {formatPercent(calculationData.returnRate)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Late Payment Ratio">
          {formatPercent(calculationData.latePaymentRatio)}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
