import { useParams, useNavigate } from 'react-router-dom';
import {
  Descriptions,
  Card,
  Button,
  Space,
  Spin,
  Result,
  Steps,
  Table,
  Tag,
  Popconfirm,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { useOrderDetail, useUpdateOrderStatus } from '@/hooks/useOrders';
import { ORDER_STATUS_MAP, DOCUMENT_STATUS_MAP } from '@/utils/constants';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';

const ORDER_FLOW = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

interface LinkedDocument {
  id: string;
  documentNo: string;
  type: string;
  fileName: string;
  status: string;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useOrderDetail(id!);
  const updateStatus = useUpdateOrderStatus();

  const detail: any = (data as any)?.data ?? data;

  const currentStep = detail
    ? ORDER_FLOW.indexOf(detail.status)
    : 0;

  const getNextStatus = (): string | null => {
    if (!detail) return null;
    const idx = ORDER_FLOW.indexOf(detail.status);
    if (idx >= 0 && idx < ORDER_FLOW.length - 1) {
      return ORDER_FLOW[idx + 1];
    }
    return null;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    await updateStatus.mutateAsync({ id: id!, status: newStatus });
  };

  const documentColumns: ColumnsType<LinkedDocument> = [
    {
      title: '文档编号',
      dataIndex: 'documentNo',
      key: 'documentNo',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <StatusBadge status={status} statusMap={DOCUMENT_STATUS_MAP} />
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle="订单信息加载失败"
        extra={
          <Button type="primary" onClick={() => navigate('/orders')}>
            返回列表
          </Button>
        }
      />
    );
  }

  const nextStatus = getNextStatus();
  const nextStatusLabel = nextStatus
    ? ORDER_STATUS_MAP[nextStatus]?.label ?? nextStatus
    : null;

  return (
    <div>
      <PageHeader
        title={`订单详情 - ${detail.orderNo ?? ''}`}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>
            返回列表
          </Button>
        }
      />

      <Card title="状态流程" style={{ marginBottom: 24 }}>
        <Steps
          current={currentStep >= 0 ? currentStep : 0}
          status={
            detail.status === 'CANCELLED' || detail.status === 'RETURNED'
              ? 'error'
              : 'process'
          }
          items={ORDER_FLOW.map((s) => ({
            title: ORDER_STATUS_MAP[s]?.label ?? s,
          }))}
        />
      </Card>

      <Card title="订单信息" style={{ marginBottom: 24 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="订单编号">{detail.orderNo}</Descriptions.Item>
          <Descriptions.Item label="企业名称">
            {detail.enterpriseName}
          </Descriptions.Item>
          <Descriptions.Item label="订单金额">
            {formatCurrency(detail.amount)}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <StatusBadge status={detail.status} statusMap={ORDER_STATUS_MAP} />
          </Descriptions.Item>
          <Descriptions.Item label="到期日">
            {formatDate(detail.dueDate)}
          </Descriptions.Item>
          <Descriptions.Item label="逾期天数">
            {detail.overdueDays && detail.overdueDays > 0 ? (
              <Tag color="red">{detail.overdueDays} 天</Tag>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDateTime(detail.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {formatDateTime(detail.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="状态操作" style={{ marginBottom: 24 }}>
        <Space wrap>
          {nextStatus && (
            <Popconfirm
              title={`确认将状态更新为"${nextStatusLabel}"?`}
              onConfirm={() => handleStatusUpdate(nextStatus)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="primary" loading={updateStatus.isPending}>
                更新为: {nextStatusLabel}
              </Button>
            </Popconfirm>
          )}

          {detail.status !== 'CANCELLED' && detail.status !== 'COMPLETED' && (
            <Popconfirm
              title="确认取消订单?"
              onConfirm={() => handleStatusUpdate('CANCELLED')}
              okText="确认"
              cancelText="取消"
            >
              <Button danger loading={updateStatus.isPending}>
                取消订单
              </Button>
            </Popconfirm>
          )}

          {detail.status === 'DELIVERED' && (
            <Popconfirm
              title="确认退货?"
              onConfirm={() => handleStatusUpdate('RETURNED')}
              okText="确认"
              cancelText="取消"
            >
              <Button danger loading={updateStatus.isPending}>
                退货
              </Button>
            </Popconfirm>
          )}
        </Space>
      </Card>

      <Card title="关联文档">
        <Table<LinkedDocument>
          columns={documentColumns}
          dataSource={detail.documents ?? []}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '暂无关联文档' }}
        />
      </Card>
    </div>
  );
}
