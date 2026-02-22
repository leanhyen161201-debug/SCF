import { Typography } from 'antd';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {subtitle && (
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        )}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}
