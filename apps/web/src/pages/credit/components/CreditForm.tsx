import { Form, InputNumber, Select, Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCreateCredit } from '@/hooks/useCredit';

// Placeholder enterprise data - in production this would come from an API
const MOCK_ENTERPRISES = [
  { id: 'placeholder-1', name: 'Enterprise 1' },
  { id: 'placeholder-2', name: 'Enterprise 2' },
];

interface CreditFormProps {
  enterprises?: Array<{ id: string; name: string }>;
}

export default function CreditForm({ enterprises = MOCK_ENTERPRISES }: CreditFormProps) {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const createMutation = useCreateCredit();

  const handleSubmit = (values: { enterpriseId: string; requestedAmount: number }) => {
    createMutation.mutate(values, {
      onSuccess: () => navigate('/credits'),
    });
  };

  return (
    <Card title="New Credit Application">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="enterpriseId"
          label="Enterprise"
          rules={[{ required: true, message: 'Please select enterprise' }]}
        >
          <Select placeholder="Select enterprise">
            {enterprises.map((ent) => (
              <Select.Option key={ent.id} value={ent.id}>
                {ent.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="requestedAmount"
          label="Requested Amount (CNY)"
          rules={[{ required: true, message: 'Please enter amount' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={10000}
            step={10000}
            formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/¥\s?|(,*)/g, '') as unknown as number}
            placeholder="Enter requested credit amount"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
            Submit Application
          </Button>
          <Button className="ml-2" onClick={() => navigate('/credits')}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
