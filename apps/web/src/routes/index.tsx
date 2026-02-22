import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy-loaded pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const KpiDetailPage = lazy(() => import('../pages/dashboard/KpiDetailPage'));
const CreditListPage = lazy(() => import('../pages/credit/CreditListPage'));
const CreditApplicationPage = lazy(() => import('../pages/credit/CreditApplicationPage'));
const CreditReviewPage = lazy(() => import('../pages/credit/CreditReviewPage'));
const OrderListPage = lazy(() => import('../pages/orders/OrderListPage'));
const OrderDetailPage = lazy(() => import('../pages/orders/OrderDetailPage'));
const DocumentListPage = lazy(() => import('../pages/documents/DocumentListPage'));
const DocumentReviewPage = lazy(() => import('../pages/documents/DocumentReviewPage'));
const RiskCenterPage = lazy(() => import('../pages/risk/RiskCenterPage'));
const RiskEventDetailPage = lazy(() => import('../pages/risk/RiskEventDetailPage'));
const LimitManagePage = lazy(() => import('../pages/limit/LimitManagePage'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}

export default function AppRoutes() {
  return (
    <SuspenseWrapper>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/kpi/:metric" element={<KpiDetailPage />} />
          <Route path="credits" element={<CreditListPage />} />
          <Route path="credits/apply" element={<CreditApplicationPage />} />
          <Route path="credits/:id" element={<CreditReviewPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="documents" element={<DocumentListPage />} />
          <Route path="documents/:id" element={<DocumentReviewPage />} />
          <Route path="risk" element={<RiskCenterPage />} />
          <Route path="risk/events/:id" element={<RiskEventDetailPage />} />
          <Route path="limits" element={<LimitManagePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </SuspenseWrapper>
  );
}
