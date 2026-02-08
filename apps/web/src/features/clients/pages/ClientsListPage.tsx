import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/stores/auth-store';
import { listClientsApi, deleteClientApi } from '../api';
import { toast } from 'sonner';

export function ClientsListPage() {
  const { t } = useTranslation('clients');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['clients', { page, search: debouncedSearch }],
    queryFn: () => listClientsApi({ page, search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(t('deleted'));
    },
  });

  const handleExportCsv = async () => {
    const res = await fetch('/api/v1/clients/export', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clienti.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clients = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="h-4 w-4" /> {t('exportCsv')}
          </Button>
          <Link to="/clients/new">
            <Button><Plus className="h-4 w-4" /> {t('addClient')}</Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tc('search')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground">{tc('loading')}</div>
      ) : clients.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">{t('noClients')}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fields.name')}</TableHead>
                <TableHead>{t('fields.type')}</TableHead>
                <TableHead>{t('fields.email')}</TableHead>
                <TableHead>{t('fields.partitaIva')}</TableHead>
                <TableHead className="w-12">{tc('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client: any) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link to={`/clients/${client.id}`} className="hover:underline">{client.name}</Link>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{t(`types.${client.type}` as any)}</Badge></TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">{client.partitaIva || '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link to={`/clients/${client.id}`}>
                          <DropdownMenuItem><Eye className="h-4 w-4" /> {tc('edit')}</DropdownMenuItem>
                        </Link>
                        <Link to={`/clients/${client.id}/edit`}>
                          <DropdownMenuItem><Pencil className="h-4 w-4" /> {tc('edit')}</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(t('deleteConfirm'))) deleteMutation.mutate(client.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" /> {tc('delete')}
                        </DropdownMenuItem>
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
                {tc('pagination.page')} {pagination.page} {tc('pagination.of')} {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  {tc('previous')}
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
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
