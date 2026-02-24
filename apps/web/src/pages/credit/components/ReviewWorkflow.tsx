import { Card, Form, Input, InputNumber, Button, Space, Radio } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useReviewCredit } from '@/hooks/useCredit';

interface ReviewWorkflowProps {
  applicationId: string;
  requestedAmount: number;
}

export default function ReviewWorkflow({ applicationId, requestedAmount }: ReviewWorkflowProps) {
  const [form] = Form.useForm();
  const reviewMutation = useReviewCredit();

  const handleSubmit = (values: { status: string; approvedAmount?: number; reviewNote?: string }) => {
    reviewMutation.mutate({ id: applicationId, ...values });
  };

  return (
    <Card title="Review Decision" className="mt-4">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="status"
          label="Decision"
          rules={[{ required: true, message: 'Please select decision' }]}
        >
          <Radio.Group>
            <Radio.Button value="APPROVED">
              <CheckOutlined /> Approve
            </Radio.Button>
            <Radio.Button value="REJECTED">
              <CloseOutlined /> Reject
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.status !== cur.status}>
          {({ getFieldValue }) =>
            getFieldValue('status') === 'APPROVED' && (
              <Form.Item
                name="approvedAmount"
                label="Approved Amount"
                initialValue={requestedAmount}
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0 as number}
                  step={10000 as number}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/¥\s?|(,*)/g, '') as unknown as number}
                />
              </Form.Item>
            )
          }
        </Form.Item>

        <Form.Item name="reviewNote" label="Review Notes">
          <Input.TextArea rows={3} placeholder="Enter review notes" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={reviewMutation.isPending}>
              Submit Review
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
