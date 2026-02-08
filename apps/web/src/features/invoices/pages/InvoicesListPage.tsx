import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Copy, Download } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate } from '@/lib/format';
import { listInvoicesApi, deleteInvoiceApi, duplicateInvoiceApi } from '../api';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export function InvoicesListPage() {
  const { t } = useTranslation('invoices');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', { page, search: debouncedSearch, status }],
    queryFn: () =>
      listInvoicesApi({
        page,
        search: debouncedSearch || undefined,
        status: (status || undefined) as any,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(t('deleted'));
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateInvoiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(t('duplicated'));
    },
  });

  const handleDownloadPdf = async (id: string, number: string) => {
    const res = await fetch(`/api/v1/invoices/${id}/pdf`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${number.replace('/', '-')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = async () => {
    const res = await fetch('/api/v1/invoices/export', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fatture.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const invoices = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="h-4 w-4" /> {t('exportCsv')}
          </Button>
          <Link to="/invoices/new">
            <Button>
              <Plus className="h-4 w-4" /> {t('addInvoice')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tc('search')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('fields.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="DRAFT">{t('status.DRAFT')}</SelectItem>
            <SelectItem value="SENT">{t('status.SENT')}</SelectItem>
            <SelectItem value="PAID">{t('status.PAID')}</SelectItem>
            <SelectItem value="OVERDUE">{t('status.OVERDUE')}</SelectItem>
            <SelectItem value="CANCELLED">{t('status.CANCELLED')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : invoices.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">{t('noInvoices')}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fields.number')}</TableHead>
                <TableHead>{t('fields.client')}</TableHead>
                <TableHead>{t('fields.issueDate')}</TableHead>
                <TableHead>{t('fields.dueDate')}</TableHead>
                <TableHead>{t('fields.status')}</TableHead>
                <TableHead className="text-right">{t('fields.netPayable')}</TableHead>
                <TableHead className="w-12">{tc('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    <Link to={`/invoices/${inv.id}`} className="hover:underline">
                      {inv.number}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.client?.name}</TableCell>
                  <TableCell>{formatDate(inv.issueDate)}</TableCell>
                  <TableCell>{formatDate(inv.dueDate)}</TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(inv.netPayable)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link to={`/invoices/${inv.id}`}>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4" /> Dettaglio
                          </DropdownMenuItem>
                        </Link>
                        {inv.status === 'DRAFT' && (
                          <Link to={`/invoices/${inv.id}/edit`}>
                            <DropdownMenuItem>
                              <Pencil className="h-4 w-4" /> {tc('edit')}
                            </DropdownMenuItem>
                          </Link>
                        )}
                        <DropdownMenuItem onClick={() => handleDownloadPdf(inv.id, inv.number)}>
                          <Download className="h-4 w-4" /> {t('downloadPdf')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateMutation.mutate(inv.id)}>
                          <Copy className="h-4 w-4" /> {t('duplicate')}
                        </DropdownMenuItem>
                        {inv.status === 'DRAFT' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (confirm(t('deleteConfirm'))) deleteMutation.mutate(inv.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" /> {tc('delete')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {tc('pagination.page')} {pagination.page} {tc('pagination.of')}{' '}
                {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  {tc('previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  {tc('next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
