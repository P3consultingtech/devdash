import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { RouteErrorBoundary } from '@/components/shared/RouteErrorBoundary';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ClientsListPage } from '@/features/clients/pages/ClientsListPage';
import { ClientFormPage } from '@/features/clients/pages/ClientFormPage';
import { ClientDetailPage } from '@/features/clients/pages/ClientDetailPage';
import { InvoicesListPage } from '@/features/invoices/pages/InvoicesListPage';
import { InvoiceFormPage } from '@/features/invoices/pages/InvoiceFormPage';
import { InvoiceDetailPage } from '@/features/invoices/pages/InvoiceDetailPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <DashboardPage />, errorElement: <RouteErrorBoundary /> },
          { path: '/clients', element: <ClientsListPage />, errorElement: <RouteErrorBoundary /> },
          {
            path: '/clients/new',
            element: <ClientFormPage />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: '/clients/:id',
            element: <ClientDetailPage />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: '/clients/:id/edit',
            element: <ClientFormPage />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: '/invoices',
            element: <InvoicesListPage />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: '/invoices/new',
            element: <InvoiceFormPage />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: '/invoices/:id',
            element: <InvoiceDetailPage />,
            errorElement: <RouteErrorBoundary />,
          },
          {
            path: '/invoices/:id/edit',
            element: <InvoiceFormPage />,
            errorElement: <RouteErrorBoundary />,
          },
          { path: '/settings', element: <SettingsPage />, errorElement: <RouteErrorBoundary /> },
        ],
      },
    ],
  },
]);
