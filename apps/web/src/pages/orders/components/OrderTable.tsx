import { Table, Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import StatusBadge from '@/components/StatusBadge';
import { ORDER_STATUS_MAP } from '@/utils/constants';
import { formatCurrency, formatDate } from '@/utils/format';

interface OrderTableProps {
  data: any[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
}

export default function OrderTable({ data, total, page, pageSize, loading, onPageChange }: OrderTableProps) {
  const columns: ColumnsType<any> = [
    {
      title: 'Order No',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (text: string, record: any) => (
        <Link to={`/orders/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Enterprise',
      dataIndex: ['enterprise', 'name'],
      key: 'enterprise',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => formatCurrency(Number(val)),
      align: 'right',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status} statusMap={ORDER_STATUS_MAP} />,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Overdue Days',
      dataIndex: 'overdueDays',
      key: 'overdueDays',
      render: (val: number) => val > 0 ? <span className="text-red-500">{val} days</span> : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: any) => (
        <Space>
          <Link to={`/orders/${record.id}`}>
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
