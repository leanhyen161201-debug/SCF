import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  BankOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  AlertOutlined,
  FundOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';

const { Sider } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '经营驾驶舱' },
  { key: '/credits', icon: <BankOutlined />, label: '授信管理' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/documents', icon: <FileTextOutlined />, label: '单据管理' },
  { key: '/risk', icon: <AlertOutlined />, label: '风控中心' },
  { key: '/limits', icon: <FundOutlined />, label: '额度管理' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  const selectedKey = menuItems.find((item) =>
    location.pathname.startsWith(item.key)
  )?.key || '/dashboard';

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={220}
      style={{
        background: '#001529',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
      }}
    >
      <div
        className="flex items-center justify-center py-4"
        style={{ height: 64, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span className="text-white text-lg font-bold">
          {collapsed ? 'SCF' : 'Supply Chain Finance'}
        </span>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
}
