import { useParams, useNavigate } from 'react-router-dom';
import {
  Descriptions,
  Card,
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Spin,
  Result,
  Table,
  Divider,
} from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { useCreditDetail, useReviewCredit } from '@/hooks/useCredit';
import { CREDIT_STATUS_MAP, DOCUMENT_STATUS_MAP } from '@/utils/constants';
import { formatCurrency, formatDateTime } from '@/utils/format';

interface ReviewFormValues {
  approvedAmount?: number;
  reviewNote?: string;
}

interface LinkedDocument {
  id: string;
  documentNo: string;
  type: string;
  fileName: string;
  status: string;
}

export default function CreditReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<ReviewFormValues>();
  const { data, isLoading, isError } = useCreditDetail(id!);
  const reviewCredit = useReviewCredit();

  const detail: any = (data as any)?.data ?? data;

  const canReview =
    detail?.status === 'PENDING' || detail?.status === 'UNDER_REVIEW';

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    const values = await form.validateFields();
    await reviewCredit.mutateAsync({
      id: id!,
      status,
      approvedAmount: values.approvedAmount,
      reviewNote: values.reviewNote,
    });
    navigate('/credits');
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
        subTitle="授信申请信息加载失败"
        extra={
          <Button type="primary" onClick={() => navigate('/credits')}>
            返回列表
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={`授信申请详情 - ${detail.applicationNo ?? ''}`}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/credits')}>
            返回列表
          </Button>
        }
      />

      <Card title="申请信息" style={{ marginBottom: 24 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="申请编号">
            {detail.applicationNo}
          </Descriptions.Item>
          <Descriptions.Item label="企业名称">
            {detail.enterpriseName}
          </Descriptions.Item>
          <Descriptions.Item label="申请金额">
            {formatCurrency(detail.requestedAmount)}
          </Descriptions.Item>
          <Descriptions.Item label="批准金额">
            {detail.approvedAmount ? formatCurrency(detail.approvedAmount) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <StatusBadge status={detail.status} statusMap={CREDIT_STATUS_MAP} />
          </Descriptions.Item>
          <Descriptions.Item label="提交时间">
            {formatDateTime(detail.submittedAt)}
          </Descriptions.Item>
          <Descriptions.Item label="审核时间" span={2}>
            {detail.reviewedAt ? formatDateTime(detail.reviewedAt) : '-'}
          </Descriptions.Item>
          {detail.reviewNote && (
            <Descriptions.Item label="审核备注" span={2}>
              {detail.reviewNote}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {canReview && (
        <Card title="审核操作" style={{ marginBottom: 24 }}>
          <Form<ReviewFormValues> form={form} layout="vertical">
            <Form.Item label="批准金额 (元)" name="approvedAmount">
              <InputNumber<number>
                style={{ width: '100%' }}
                placeholder="请输入批准金额（留空则使用申请金额）"
                min={0}
                precision={2}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) =>
                  Number(value?.replace(/,/g, '') ?? 0)
                }
              />
            </Form.Item>

            <Form.Item
              label="审核备注"
              name="reviewNote"
              rules={[{ max: 500, message: '备注不能超过500字' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="请输入审核备注"
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={reviewCredit.isPending}
                  onClick={() => handleReview('APPROVED')}
                >
                  通过
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  loading={reviewCredit.isPending}
                  onClick={() => handleReview('REJECTED')}
                >
                  驳回
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

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
