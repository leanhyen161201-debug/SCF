import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Space, Select, Input, Tag } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { useOrderList } from '@/hooks/useOrders';
import { ORDER_STATUS_MAP } from '@/utils/constants';
import { formatCurrency, formatDate } from '@/utils/format';

interface Order {
  id: string;
  orderNo: string;
  enterpriseName: string;
  amount: number;
  status: string;
  dueDate: string;
  overdueDays?: number;
}

export default function OrderListPage() {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const { data, isLoading } = useOrderList(filters);

  const list: Order[] = (data as any)?.data ?? (data as any)?.list ?? [];
  const total: number = (data as any)?.total ?? list.length;

  const columns: ColumnsType<Order> = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
    },
    {
      title: '企业名称',
      dataIndex: 'enterpriseName',
      key: 'enterpriseName',
      width: 200,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: number) => formatCurrency(amount),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <StatusBadge status={status} statusMap={ORDER_STATUS_MAP} />
      ),
    },
    {
      title: '到期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      render: (date: string) => formatDate(date),
      sorter: (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: '逾期天数',
      dataIndex: 'overdueDays',
      key: 'overdueDays',
      width: 100,
      render: (days?: number) => {
        if (!days || days <= 0) return '-';
        const color = days > 30 ? 'red' : days > 7 ? 'orange' : 'gold';
        return <Tag color={color}>{days} 天</Tag>;
      },
      sorter: (a, b) => (a.overdueDays ?? 0) - (b.overdueDays ?? 0),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Link to={`/orders/${record.id}`}>
          <Button type="link" icon={<EyeOutlined />} size="small">
            详情
          </Button>
        </Link>
      ),
    },
  ];

  const handleSearch = (keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword, page: 1 }));
  };

  const handleStatusFilter = (status: string | undefined) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleEnterpriseFilter = (enterprise: string | undefined) => {
    setFilters((prev) => ({ ...prev, enterpriseName: enterprise, page: 1 }));
  };

  const handleTableChange = (pagination: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  return (
    <div>
      <PageHeader title="订单管理" subtitle="管理所有订单信息" />

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Input.Search
          placeholder="搜索订单编号或企业名称"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 160 }}
          onChange={handleStatusFilter}
          options={Object.entries(ORDER_STATUS_MAP).map(([value, { label }]) => ({
            label,
            value,
          }))}
        />
        <Select
          placeholder="企业筛选"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 200 }}
          onChange={handleEnterpriseFilter}
          options={[]}
        />
      </div>

      <Table<Order>
        columns={columns}
        dataSource={list}
        rowKey="id"
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
      />
    </div>
  );
}
