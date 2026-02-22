import { Layout, Button, Dropdown, Space, Breadcrumb as AntBreadcrumb } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { useLogout } from '../hooks/useAuth';

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const { sidebarCollapsed, toggleSidebar, breadcrumbs } = useUIStore();
  const logout = useLogout();

  const dropdownItems = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: `${user?.username || 'User'} (${user?.role || ''})`,
        disabled: true,
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: logout,
      },
    ],
  };

  return (
    <Layout.Header
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        height: 64,
      }}
    >
      <Space>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
        />
        <AntBreadcrumb
          items={[
            { title: <Link to="/dashboard">Home</Link> },
            ...breadcrumbs.map((b) => ({
              title: <Link to={b.path}>{b.label}</Link>,
            })),
          ]}
        />
      </Space>

      <Dropdown menu={dropdownItems} placement="bottomRight">
        <Button type="text" icon={<UserOutlined />}>
          {user?.username || 'User'}
        </Button>
      </Dropdown>
    </Layout.Header>
  );
}
