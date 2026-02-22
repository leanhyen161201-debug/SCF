import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Alert, Spin } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useKpiDetail } from '@/hooks/useDashboard';
import { useUIStore } from '@/stores/uiStore';
import PageHeader from '@/components/PageHeader';
import { formatCurrency, formatNumber, formatDate } from '@/utils/format';

const metricLabelMap: Record<string, string> = {
  totalCredit: '总授信额度',
  pendingApplications: '待审申请',
  activeOrders: '活跃订单',
  overdueOrders: '逾期订单',
  riskEvents: '风险事件',
  creditUtilization: '授信使用率',
};

const metricColumnsMap: Record<string, ColumnsType<any>> = {
  totalCredit: [
    { title: '企业名称', dataIndex: 'companyName', key: 'companyName' },
    { title: '授信额度', dataIndex: 'creditLimit', key: 'creditLimit', render: (v: number) => formatCurrency(v) },
    { title: '已用额度', dataIndex: 'usedAmount', key: 'usedAmount', render: (v: number) => formatCurrency(v) },
    { title: '可用额度', dataIndex: 'availableAmount', key: 'availableAmount', render: (v: number) => formatCurrency(v) },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', render: (v: string) => formatDate(v) },
  ],
  pendingApplications: [
    { title: '申请编号', dataIndex: 'applicationNo', key: 'applicationNo' },
    { title: '申请企业', dataIndex: 'companyName', key: 'companyName' },
    { title: '申请金额', dataIndex: 'amount', key: 'amount', render: (v: number) => formatCurrency(v) },
    { title: '申请时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => formatDate(v) },
    { title: '状态', dataIndex: 'status', key: 'status' },
  ],
  activeOrders: [
    { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '买方', dataIndex: 'buyerName', key: 'buyerName' },
    { title: '卖方', dataIndex: 'sellerName', key: 'sellerName' },
    { title: '订单金额', dataIndex: 'amount', key: 'amount', render: (v: number) => formatCurrency(v) },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => formatDate(v) },
    { title: '状态', dataIndex: 'status', key: 'status' },
  ],
  overdueOrders: [
    { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '买方', dataIndex: 'buyerName', key: 'buyerName' },
    { title: '逾期金额', dataIndex: 'overdueAmount', key: 'overdueAmount', render: (v: number) => formatCurrency(v) },
    { title: '逾期天数', dataIndex: 'overdueDays', key: 'overdueDays', render: (v: number) => formatNumber(v) },
    { title: '到期日', dataIndex: 'dueDate', key: 'dueDate', render: (v: string) => formatDate(v) },
  ],
  riskEvents: [
    { title: '事件编号', dataIndex: 'eventNo', key: 'eventNo' },
    { title: '风险类型', dataIndex: 'riskType', key: 'riskType' },
    { title: '严重程度', dataIndex: 'severity', key: 'severity' },
    { title: '关联企业', dataIndex: 'companyName', key: 'companyName' },
    { title: '发生时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => formatDate(v) },
    { title: '状态', dataIndex: 'status', key: 'status' },
  ],
  creditUtilization: [
    { title: '企业名称', dataIndex: 'companyName', key: 'companyName' },
    { title: '授信额度', dataIndex: 'creditLimit', key: 'creditLimit', render: (v: number) => formatCurrency(v) },
    { title: '已用额度', dataIndex: 'usedAmount', key: 'usedAmount', render: (v: number) => formatCurrency(v) },
    { title: '使用率', dataIndex: 'utilization', key: 'utilization', render: (v: number) => `${(v * 100).toFixed(1)}%` },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', render: (v: string) => formatDate(v) },
  ],
};

const defaultColumns: ColumnsType<any> = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '值', dataIndex: 'value', key: 'value' },
];

export default function KpiDetailPage() {
  const { metric } = useParams<{ metric: string }>();
  const setBreadcrumbs = useUIStore((s) => s.setBreadcrumbs);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const { data, isLoading, error } = useKpiDetail(
    metric ?? '',
    pagination.current,
    pagination.pageSize,
  );

  const metricLabel = metric ? metricLabelMap[metric] ?? metric : '';

  useEffect(() => {
    setBreadcrumbs([
      { label: '仪表盘', path: '/dashboard' },
      { label: metricLabel, path: `/dashboard/kpi/${metric}` },
    ]);
    return () => setBreadcrumbs([]);
  }, [metric, metricLabel, setBreadcrumbs]);

  if (error) {
    return <Alert type="error" message="加载KPI详情失败" showIcon />;
  }

  const columns = metric ? metricColumnsMap[metric] ?? defaultColumns : defaultColumns;
  const tableData = data?.data?.records ?? [];
  const total = data?.data?.total ?? 0;

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination({
      current: pag.current ?? 1,
      pageSize: pag.pageSize ?? 20,
    });
  };

  return (
    <div>
      <PageHeader title={`${metricLabel}明细`} subtitle={`查看${metricLabel}的详细数据`} />
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
          }}
          onChange={handleTableChange}
        />
      </Spin>
    </div>
  );
}
