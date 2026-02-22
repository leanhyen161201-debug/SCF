import { Table, Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import StatusBadge from '@/components/StatusBadge';
import { CREDIT_STATUS_MAP } from '@/utils/constants';
import { formatCurrency, formatDate } from '@/utils/format';

interface CreditTableProps {
  data: any[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
}

export default function CreditTable({ data, total, page, pageSize, loading, onPageChange }: CreditTableProps) {
  const columns: ColumnsType<any> = [
    {
      title: 'Application No',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      render: (text: string, record: any) => (
        <Link to={`/credits/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Enterprise',
      dataIndex: ['enterprise', 'name'],
      key: 'enterprise',
    },
    {
      title: 'Requested Amount',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      render: (val: number) => formatCurrency(Number(val)),
      align: 'right',
    },
    {
      title: 'Approved Amount',
      dataIndex: 'approvedAmount',
      key: 'approvedAmount',
      render: (val: number | null) => val ? formatCurrency(Number(val)) : '-',
      align: 'right',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status} statusMap={CREDIT_STATUS_MAP} />,
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: any) => (
        <Space>
          <Link to={`/credits/${record.id}`}>
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
