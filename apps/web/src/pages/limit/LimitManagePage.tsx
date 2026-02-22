import { useState } from 'react';
import { Table, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import { useLimitList, useCalculateLimit } from '@/hooks/useLimit';
import { formatCurrency, formatDate } from '@/utils/format';
import LimitAdjustForm from './components/LimitAdjustForm';

export default function LimitManagePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [adjustTarget, setAdjustTarget] = useState<{ enterpriseId: string; currentLimit: number } | null>(null);

  const { data, isLoading } = useLimitList({ page, pageSize });
  const calculateMutation = useCalculateLimit();
  const result = (data as any)?.data || { items: [], total: 0 };

  const columns: ColumnsType<any> = [
    {
      title: 'Enterprise',
      dataIndex: ['enterprise', 'name'],
      key: 'enterprise',
    },
    {
      title: 'Total Limit',
      dataIndex: 'totalLimit',
      key: 'totalLimit',
      render: (val: number) => formatCurrency(Number(val)),
      align: 'right',
    },
    {
      title: 'Used',
      dataIndex: 'usedLimit',
      key: 'usedLimit',
      render: (val: number) => formatCurrency(Number(val)),
      align: 'right',
    },
    {
      title: 'Available',
      dataIndex: 'availableLimit',
      key: 'availableLimit',
      render: (val: number) => (
        <span className={Number(val) === 0 ? 'text-red-500' : 'text-green-600'}>
          {formatCurrency(Number(val))}
        </span>
      ),
      align: 'right',
    },
    {
      title: 'Utilization',
      key: 'utilization',
      render: (_: unknown, record: any) => {
        const total = Number(record.totalLimit);
        const used = Number(record.usedLimit);
        const rate = total > 0 ? ((used / total) * 100).toFixed(1) : '0.0';
        return `${rate}%`;
      },
      align: 'center',
    },
    {
      title: 'Last Calculated',
      dataIndex: 'lastCalculatedAt',
      key: 'lastCalculatedAt',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: any) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() => calculateMutation.mutate(record.enterpriseId)}
            loading={calculateMutation.isPending}
          >
            Recalculate
          </Button>
          <Button
            size="small"
            onClick={() => setAdjustTarget({
              enterpriseId: record.enterpriseId,
              currentLimit: Number(record.totalLimit),
            })}
          >
            Adjust
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Credit Limit Management" subtitle="Calculate and adjust enterprise credit limits" />

      <Table
        columns={columns}
        dataSource={result.items}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: result.total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          showSizeChanger: true,
          showTotal: (t) => `Total ${t} items`,
        }}
      />

      {adjustTarget && (
        <LimitAdjustForm
          open={true}
          onClose={() => setAdjustTarget(null)}
          enterpriseId={adjustTarget.enterpriseId}
          currentLimit={adjustTarget.currentLimit}
        />
      )}
    </div>
  );
}
