import { Card, Row, Col, Badge, Statistic } from 'antd';

interface RiskData {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface RiskOverviewProps {
  data: RiskData;
}

const riskLevels: { key: keyof RiskData; label: string; color: string; badgeStatus: 'error' | 'warning' | 'processing' | 'success' }[] = [
  { key: 'critical', label: '严重', color: '#ff4d4f', badgeStatus: 'error' },
  { key: 'high', label: '高', color: '#fa8c16', badgeStatus: 'warning' },
  { key: 'medium', label: '中', color: '#faad14', badgeStatus: 'processing' },
  { key: 'low', label: '低', color: '#52c41a', badgeStatus: 'success' },
];

export default function RiskOverview({ data }: RiskOverviewProps) {
  const total = data.critical + data.high + data.medium + data.low;

  return (
    <Card title="风险概览">
      <Row gutter={[16, 16]}>
        {riskLevels.map(({ key, label, color, badgeStatus }) => (
          <Col span={12} key={key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge status={badgeStatus} />
              <Statistic
                title={label}
                value={data[key]}
                valueStyle={{ color, fontSize: 24 }}
                suffix={
                  total > 0 ? (
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                      / {((data[key] / total) * 100).toFixed(0)}%
                    </span>
                  ) : null
                }
              />
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
