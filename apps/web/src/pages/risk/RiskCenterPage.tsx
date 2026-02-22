import { useState } from 'react';
import { Select, Space, Tabs } from 'antd';
import PageHeader from '@/components/PageHeader';
import { useRiskEventList } from '@/hooks/useRisk';
import RiskEventTable from './components/RiskEventTable';
import RiskRuleConfig from './components/RiskRuleConfig';

export default function RiskCenterPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data, isLoading } = useRiskEventList({ page, pageSize, ...filters });
  const result = (data as any)?.data || { items: [], total: 0 };

  return (
    <div>
      <PageHeader title="Risk Control Center" subtitle="Monitor and manage risk events" />

      <Tabs
        defaultActiveKey="events"
        items={[
          {
            key: 'events',
            label: 'Risk Events',
            children: (
              <>
                <Space className="mb-4">
                  <Select
                    placeholder="Severity"
                    allowClear
                    style={{ width: 120 }}
                    onChange={(val) => { setFilters((f) => ({ ...f, severity: val })); setPage(1); }}
                  >
                    <Select.Option value="CRITICAL">Critical</Select.Option>
                    <Select.Option value="HIGH">High</Select.Option>
                    <Select.Option value="MEDIUM">Medium</Select.Option>
                    <Select.Option value="LOW">Low</Select.Option>
                  </Select>
                  <Select
                    placeholder="Status"
                    allowClear
                    style={{ width: 120 }}
                    onChange={(val) => { setFilters((f) => ({ ...f, status: val })); setPage(1); }}
                  >
                    <Select.Option value="PENDING">Pending</Select.Option>
                    <Select.Option value="PROCESSING">Processing</Select.Option>
                    <Select.Option value="RESOLVED">Resolved</Select.Option>
                    <Select.Option value="ESCALATED">Escalated</Select.Option>
                  </Select>
                </Space>

                <RiskEventTable
                  data={result.items}
                  total={result.total}
                  page={page}
                  pageSize={pageSize}
                  loading={isLoading}
                  onPageChange={(p, ps) => { setPage(p); setPageSize(ps); }}
                />
              </>
            ),
          },
          {
            key: 'rules',
            label: 'Risk Rules',
            children: <RiskRuleConfig />,
          },
        ]}
      />
    </div>
  );
}
