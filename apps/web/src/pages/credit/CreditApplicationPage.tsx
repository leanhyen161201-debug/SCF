import { useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button, Card, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { useCreateCredit } from '@/hooks/useCredit';

interface CreditFormValues {
  enterpriseId: string;
  requestedAmount: number;
}

export default function CreditApplicationPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<CreditFormValues>();
  const createCredit = useCreateCredit();

  const handleSubmit = async (values: CreditFormValues) => {
    await createCredit.mutateAsync(values);
    navigate('/credits');
  };

  return (
    <div>
      <PageHeader
        title="新建授信申请"
        subtitle="填写授信申请信息"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/credits')}>
            返回列表
          </Button>
        }
      />

      <Card style={{ maxWidth: 640 }}>
        <Form<CreditFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="企业"
            name="enterpriseId"
            rules={[{ required: true, message: '请选择企业' }]}
          >
            <Select
              placeholder="请选择企业"
              showSearch
              optionFilterProp="label"
              options={[]}
            />
          </Form.Item>

          <Form.Item
            label="申请金额 (元)"
            name="requestedAmount"
            rules={[
              { required: true, message: '请输入申请金额' },
              {
                type: 'number',
                min: 1,
                message: '金额必须大于0',
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入申请金额"
              min={1}
              precision={2}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) =>
                Number(value?.replace(/,/g, '') ?? 0)
              }
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createCredit.isPending}
              >
                提交申请
              </Button>
              <Button onClick={() => navigate('/credits')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
