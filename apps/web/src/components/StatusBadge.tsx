import { Tag } from 'antd';

interface StatusBadgeProps {
  status: string;
  statusMap: Record<string, { label: string; color: string }>;
}

export default function StatusBadge({ status, statusMap }: StatusBadgeProps) {
  const config = statusMap[status] || { label: status, color: 'default' };
  return <Tag color={config.color}>{config.label}</Tag>;
}
