import { Form, Select, Button, Space } from 'antd';

interface OrderFiltersProps {
  onFilter: (values: Record<string, string>) => void;
  onReset: () => void;
}

export default function OrderFilters({ onFilter, onReset }: OrderFiltersProps) {
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="inline" onFinish={onFilter} className="mb-4">
      <Form.Item name="status">
        <Select placeholder="Status" allowClear style={{ width: 150 }}>
          <Select.Option value="CREATED">Created</Select.Option>
          <Select.Option value="CONFIRMED">Confirmed</Select.Option>
          <Select.Option value="SHIPPED">Shipped</Select.Option>
          <Select.Option value="DELIVERED">Delivered</Select.Option>
          <Select.Option value="COMPLETED">Completed</Select.Option>
          <Select.Option value="RETURNED">Returned</Select.Option>
          <Select.Option value="CANCELLED">Cancelled</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">Filter</Button>
          <Button onClick={() => { form.resetFields(); onReset(); }}>Reset</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
