import { Table, Space, Button, Tag } from 'antd';
import { Link } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import StatusBadge from '@/components/StatusBadge';
import { RISK_SEVERITY_MAP, RISK_EVENT_STATUS_MAP } from '@/utils/constants';
import { formatDateTime } from '@/utils/format';

interface RiskEventTableProps {
  data: any[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
}

const RISK_TYPE_MAP: Record<string, string> = {
  OVERDUE: 'Overdue',
  HIGH_RETURN_RATE: 'High Return Rate',
  AMOUNT_MISMATCH: 'Amount Mismatch',
  BLACKLIST_HIT: 'Blacklist Hit',
  ABNORMAL_FLOW: 'Abnormal Flow',
};

const ACTION_MAP: Record<string, { label: string; color: string }> = {
  ALERT: { label: 'Alert', color: 'blue' },
  FREEZE: { label: 'Freeze', color: 'red' },
  BLOCK: { label: 'Block', color: 'orange' },
  REJECT: { label: 'Reject', color: 'red' },
  MANUAL_REVIEW: { label: 'Manual Review', color: 'gold' },
};

export default function RiskEventTable({ data, total, page, pageSize, loading, onPageChange }: RiskEventTableProps) {
  const columns: ColumnsType<any> = [
    {
      title: 'Event No',
      dataIndex: 'eventNo',
      key: 'eventNo',
      render: (text: string, record: any) => (
        <Link to={`/risk/events/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Enterprise',
      dataIndex: ['enterprise', 'name'],
      key: 'enterprise',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => RISK_TYPE_MAP[type] || type,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <StatusBadge status={severity} statusMap={RISK_SEVERITY_MAP} />
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => {
        const config = ACTION_MAP[action] || { label: action, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <StatusBadge status={status} statusMap={RISK_EVENT_STATUS_MAP} />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => formatDateTime(val),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: any) => (
        <Space>
          <Link to={`/risk/events/${record.id}`}>
            <Button size="small">View</Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
        showSizeChanger: true,
        showTotal: (t) => `Total ${t} items`,
      }}
    />
  );
}
