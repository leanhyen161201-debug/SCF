import { Layout } from 'antd';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBoundary from '../components/ErrorBoundary';
import { useUIStore } from '../stores/uiStore';

export default function MainLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header />
        <Layout.Content style={{ margin: 24, minHeight: 280 }}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
