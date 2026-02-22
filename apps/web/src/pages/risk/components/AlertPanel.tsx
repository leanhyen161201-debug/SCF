import { List, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { RISK_SEVERITY_MAP } from '@/utils/constants';
import { formatDateTime } from '@/utils/format';

interface Alert {
  id: string;
  eventNo: string;
  enterpriseName: string;
  type: string;
  severity: string;
  description: string;
  createdAt: string;
}

interface AlertPanelProps {
  alerts: Alert[];
  loading?: boolean;
}

export default function AlertPanel({ alerts, loading }: AlertPanelProps) {
  return (
    <List
      loading={loading}
      dataSource={alerts}
      renderItem={(alert) => {
        const severityConfig = RISK_SEVERITY_MAP[alert.severity] || { label: alert.severity, color: 'default' };
        return (
          <List.Item>
            <List.Item.Meta
              title={
                <div className="flex items-center gap-2">
                  <Tag color={severityConfig.color}>{severityConfig.label}</Tag>
                  <Link to={`/risk/events/${alert.id}`}>{alert.eventNo}</Link>
                  <Typography.Text type="secondary">- {alert.enterpriseName}</Typography.Text>
                </div>
              }
              description={
                <div>
                  <div>{alert.description}</div>
                  <Typography.Text type="secondary" className="text-xs">
                    {formatDateTime(alert.createdAt)}
                  </Typography.Text>
                </div>
              }
            />
          </List.Item>
        );
      }}
    />
  );
}
