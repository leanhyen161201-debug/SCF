import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';

interface KpiCardProps {
  title: string;
  value: string | number;
  prefix?: React.ReactNode;
  suffix?: string;
  trend: 'up' | 'down' | 'flat';
  onClick?: () => void;
}

const trendConfig = {
  up: {
    icon: <ArrowUpOutlined />,
    color: '#52c41a',
  },
  down: {
    icon: <ArrowDownOutlined />,
    color: '#ff4d4f',
  },
  flat: {
    icon: <MinusOutlined />,
    color: '#8c8c8c',
  },
};

export default function KpiCard({ title, value, prefix, suffix, trend, onClick }: KpiCardProps) {
  const { icon, color } = trendConfig[trend];

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={
          <span style={{ fontSize: 14 }}>
            {suffix && <span style={{ marginRight: 8 }}>{suffix}</span>}
            <span style={{ color }}>{icon}</span>
          </span>
        }
      />
    </Card>
  );
}
