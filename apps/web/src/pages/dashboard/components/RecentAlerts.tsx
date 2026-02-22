import { Card, List, Tag } from 'antd';
import { formatDateTime } from '@/utils/format';

interface Alert {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  createdAt: string;
}

interface RecentAlertsProps {
  alerts: Alert[];
}

const severityColorMap: Record<string, string> = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'gold',
  LOW: 'green',
};

const severityLabelMap: Record<string, string> = {
  CRITICAL: '严重',
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

export default function RecentAlerts({ alerts }: RecentAlertsProps) {
  return (
    <Card title="最近告警">
      <List
        dataSource={alerts}
        renderItem={(alert) => (
          <List.Item key={alert.id}>
            <List.Item.Meta
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag color={severityColorMap[alert.severity]}>
                    {severityLabelMap[alert.severity] || alert.severity}
                  </Tag>
                  <span>{alert.title}</span>
                </div>
              }
              description={alert.message}
            />
            <span style={{ color: '#8c8c8c', fontSize: 12, whiteSpace: 'nowrap' }}>
              {formatDateTime(alert.createdAt)}
            </span>
          </List.Item>
        )}
        locale={{ emptyText: '暂无告警' }}
      />
    </Card>
  );
}
