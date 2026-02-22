import { Table, Tag, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRiskRules } from '@/hooks/useRisk';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RiskRuleConfig() {
  const { data, isLoading } = useRiskRules();
  const rules = (data as any)?.data || [];

  if (isLoading) return <LoadingSpinner />;

  const columns: ColumnsType<any> = [
    { title: 'Rule Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (val: string) => {
        const colors: Record<string, string> = { LOW: 'green', MEDIUM: 'gold', HIGH: 'orange', CRITICAL: 'red' };
        return <Tag color={colors[val] || 'default'}>{val}</Tag>;
      },
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (val: boolean) => <Switch checked={val} disabled />,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={rules}
      rowKey="id"
      pagination={false}
      size="small"
    />
  );
}
