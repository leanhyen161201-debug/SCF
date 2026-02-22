import { Form, Input, Button } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useLogin } from '@/hooks/useAuth';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [form] = Form.useForm<LoginFormValues>();
  const { mutate: login, isPending } = useLogin();

  const handleFinish = (values: LoginFormValues) => {
    login(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      autoComplete="off"
      size="large"
    >
      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱地址' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="请输入邮箱地址" />
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6个字符' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isPending} block>
          登录
        </Button>
      </Form.Item>
    </Form>
  );
}
