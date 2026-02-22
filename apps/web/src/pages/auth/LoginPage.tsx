import { Card, Typography } from 'antd';
import LoginForm from './components/LoginForm';

const { Title } = Typography;

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{ width: 420, boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)' }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Supply Chain Finance System
          </Title>
          <Typography.Text type="secondary">
            供应链金融管理平台
          </Typography.Text>
        </div>
        <LoginForm />
      </Card>
    </div>
  );
}
