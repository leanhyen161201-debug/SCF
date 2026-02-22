import { useParams } from 'react-router-dom';
import { Card, Descriptions, Button, Form, Input, Select, Space, Spin, Typography, Tag } from 'antd';
import { useRiskEventDetail, useHandleRiskEvent } from '@/hooks/useRisk';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { RISK_SEVERITY_MAP, RISK_EVENT_STATUS_MAP } from '@/utils/constants';
import { formatDateTime } from '@/utils/format';
import DrilldownBreadcrumb from '@/components/DrilldownBreadcrumb';

export default function RiskEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useRiskEventDetail(id!);
  const handleMutation = useHandleRiskEvent();
  const [form] = Form.useForm();

  const event = (data as any)?.data;

  if (isLoading) return <Spin size="large" className="flex justify-center mt-20" />;
  if (!event) return <Typography.Text>Event not found</Typography.Text>;

  const canHandle = ['PENDING', 'PROCESSING'].includes(event.status);

  const handleSubmit = (values: { status: string; handleNote?: string }) => {
    handleMutation.mutate({ id: event.id, ...values });
  };

  return (
    <div>
      <DrilldownBreadcrumb
        items={[
          { label: 'Risk Center', path: '/risk' },
          { label: event.eventNo },
        ]}
      />

      <PageHeader title={`Risk Event: ${event.eventNo}`} />

      <Card className="mb-4">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Event No">{event.eventNo}</Descriptions.Item>
          <Descriptions.Item label="Enterprise">{event.enterprise?.name}</Descriptions.Item>
          <Descriptions.Item label="Type">{event.type}</Descriptions.Item>
          <Descriptions.Item label="Severity">
            <StatusBadge status={event.severity} statusMap={RISK_SEVERITY_MAP} />
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusBadge status={event.status} statusMap={RISK_EVENT_STATUS_MAP} />
          </Descriptions.Item>
          <Descriptions.Item label="Action">
            <Tag color="red">{event.action}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {event.description}
          </Descriptions.Item>
          <Descriptions.Item label="Trigger Rule">{event.triggerRule}</Descriptions.Item>
          <Descriptions.Item label="Trigger Value">{event.triggerValue}</Descriptions.Item>
          <Descriptions.Item label="Threshold">{event.thresholdValue}</Descriptions.Item>
          <Descriptions.Item label="Created">{formatDateTime(event.createdAt)}</Descriptions.Item>
          {event.handledBy && (
            <Descriptions.Item label="Handled By">{event.handledBy}</Descriptions.Item>
          )}
          {event.handledAt && (
            <Descriptions.Item label="Handled At">{formatDateTime(event.handledAt)}</Descriptions.Item>
          )}
          {event.handleNote && (
            <Descriptions.Item label="Handle Note" span={2}>{event.handleNote}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {canHandle && (
        <Card title="Handle Event">
          <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 500 }}>
            <Form.Item
              name="status"
              label="New Status"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select status">
                <Select.Option value="PROCESSING">Processing</Select.Option>
                <Select.Option value="RESOLVED">Resolved</Select.Option>
                <Select.Option value="ESCALATED">Escalated</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="handleNote" label="Note">
              <Input.TextArea rows={3} placeholder="Enter handling notes" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={handleMutation.isPending}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}
