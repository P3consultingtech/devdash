import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAuthStore } from '@/stores/auth-store';
import { formatCurrency, formatDate } from '@/lib/format';
import { getSummaryApi, getRevenueApi, getInvoicesByStatusApi, getTopClientsApi, getRecentActivityApi } from '../api';
import { Link } from 'react-router-dom';
import { DollarSign, Clock, AlertTriangle, Users, FileText, CheckCircle } from 'lucide-react';

const COLORS = ['hsl(221.2, 83.2%, 53.3%)', 'hsl(142.1, 76.2%, 36.3%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84.2%, 60.2%)', 'hsl(262.1, 83.3%, 57.8%)'];

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');
  const user = useAuthStore((s) => s.user);
  const year = new Date().getFullYear();

  const { data: summary } = useQuery({ queryKey: ['dashboard-summary', year], queryFn: () => getSummaryApi(year) });
  const { data: revenue } = useQuery({ queryKey: ['dashboard-revenue', year], queryFn: () => getRevenueApi(year) });
  const { data: byStatus } = useQuery({ queryKey: ['dashboard-by-status', year], queryFn: () => getInvoicesByStatusApi(year) });
  const { data: topClients } = useQuery({ queryKey: ['dashboard-top-clients', year], queryFn: () => getTopClientsApi(year) });
  const { data: activity } = useQuery({ queryKey: ['dashboard-activity'], queryFn: getRecentActivityApi });

  const kpis = [
    { key: 'totalRevenue', value: summary?.totalRevenue ?? 0, icon: DollarSign, format: true },
    { key: 'outstanding', value: summary?.outstandingAmount ?? 0, icon: Clock, format: true },
    { key: 'overdue', value: summary?.overdueAmount ?? 0, icon: AlertTriangle, format: true },
    { key: 'totalClients', value: summary?.totalClients ?? 0, icon: Users, format: false },
    { key: 'totalInvoices', value: summary?.totalInvoices ?? 0, icon: FileText, format: false },
    { key: 'paidInvoices', value: summary?.paidInvoices ?? 0, icon: CheckCircle, format: false },
  ];

  const revenueChartData = (revenue ?? []).map((r) => ({
    name: t(`months.${r.month}` as any),
    revenue: r.revenue / 100,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('welcome', { name: user?.firstName })}</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map(({ key, value, icon: Icon, format }) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t(`kpi.${key}` as any)}</span>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {format ? formatCurrency(value) : value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader><CardTitle>{t('charts.monthlyRevenue')}</CardTitle></CardHeader>
          <CardContent>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`€${value.toFixed(2)}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">{t('noData')}</div>
            )}
          </CardContent>
        </Card>

        {/* Invoices by Status */}
        <Card>
          <CardHeader><CardTitle>{t('charts.invoicesByStatus')}</CardTitle></CardHeader>
          <CardContent>
            {byStatus && byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={byStatus.map((s) => ({ name: s.status, value: s.count }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {byStatus.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">{t('noData')}</div>
            )}
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader><CardTitle>{t('charts.topClients')}</CardTitle></CardHeader>
          <CardContent>
            {topClients && topClients.length > 0 ? (
              <Table>
                <TableBody>
                  {topClients.map((client) => (
                    <TableRow key={client.clientId}>
                      <TableCell>
                        <Link to={`/clients/${client.clientId}`} className="font-medium hover:underline">
                          {client.clientName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{client.invoiceCount} fatture</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(client.totalRevenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">{t('noData')}</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader><CardTitle>{t('charts.recentActivity')}</CardTitle></CardHeader>
          <CardContent>
            {activity && activity.length > 0 ? (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.type === 'invoice_paid' ? 'PAID' : item.type === 'invoice_sent' ? 'SENT' : 'DRAFT'} />
                      <Link to={`/invoices/${item.id}`} className="hover:underline">{item.description}</Link>
                    </div>
                    <span className="text-muted-foreground">{formatDate(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">{t('noData')}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
