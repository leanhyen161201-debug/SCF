import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Space, Select, Input } from 'antd';
import { PlusOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { useCreditList } from '@/hooks/useCredit';
import { CREDIT_STATUS_MAP } from '@/utils/constants';
import { formatCurrency, formatDateTime } from '@/utils/format';

interface CreditApplication {
  id: string;
  applicationNo: string;
  enterpriseName: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: string;
  submittedAt: string;
}

export default function CreditListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const { data, isLoading } = useCreditList(filters);

  const list: CreditApplication[] = (data as any)?.data ?? (data as any)?.list ?? [];
  const total: number = (data as any)?.total ?? list.length;

  const columns: ColumnsType<CreditApplication> = [
    {
      title: '申请编号',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      width: 180,
    },
    {
      title: '企业名称',
      dataIndex: 'enterpriseName',
      key: 'enterpriseName',
      width: 200,
    },
    {
      title: '申请金额',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      width: 150,
      render: (amount: number) => formatCurrency(amount),
      sorter: (a, b) => a.requestedAmount - b.requestedAmount,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <StatusBadge status={status} statusMap={CREDIT_STATUS_MAP} />
      ),
      filters: Object.entries(CREDIT_STATUS_MAP).map(([value, { label }]) => ({
        text: label,
        value,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 180,
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Link to={`/credits/${record.id}`}>
            <Button type="link" icon={<EyeOutlined />} size="small">
              查看
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  const handleSearch = (keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword, page: 1 }));
  };

  const handleStatusFilter = (status: string | undefined) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
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
      <PageHeader
        title="授信申请管理"
        subtitle="管理所有授信申请"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/credits/apply')}
          >
            新建申请
          </Button>
        }
      />

      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <Input.Search
          placeholder="搜索申请编号或企业名称"
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
          options={Object.entries(CREDIT_STATUS_MAP).map(([value, { label }]) => ({
            label,
            value,
          }))}
        />
      </div>

      <Table<CreditApplication>
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
