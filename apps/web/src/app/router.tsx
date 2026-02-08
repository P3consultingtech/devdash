import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
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
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/clients', element: <ClientsListPage /> },
          { path: '/clients/new', element: <ClientFormPage /> },
          { path: '/clients/:id', element: <ClientDetailPage /> },
          { path: '/clients/:id/edit', element: <ClientFormPage /> },
          { path: '/invoices', element: <InvoicesListPage /> },
          { path: '/invoices/new', element: <InvoiceFormPage /> },
          { path: '/invoices/:id', element: <InvoiceDetailPage /> },
          { path: '/invoices/:id/edit', element: <InvoiceFormPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
