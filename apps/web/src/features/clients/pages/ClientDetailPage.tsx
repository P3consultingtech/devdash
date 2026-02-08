import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/format';
import { DetailSkeleton } from '@/components/shared/DetailSkeleton';
import { getClientApi, deleteClientApi } from '../api';
import { toast } from 'sonner';

export function ClientDetailPage() {
  const { t } = useTranslation('clients');
  const { t: tc } = useTranslation('common');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientApi(id!),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteClientApi(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(t('deleted'));
      navigate('/clients');
    },
  });

  if (isLoading) return <DetailSkeleton />;
  if (!client)
    return <div className="py-10 text-center text-muted-foreground">{tc('noResults')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label={tc('back')}
          onClick={() => navigate('/clients')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <Badge variant="secondary">{t(`types.${client.type}` as any)}</Badge>
        <div className="ml-auto flex gap-2">
          <Link to={`/clients/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4" /> {tc('edit')}
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" /> {tc('delete')}
          </Button>
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{tc('deleteConfirm.title')}</AlertDialogTitle>
                <AlertDialogDescription>{t('deleteConfirm')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteMutation.mutate()}
                >
                  {tc('delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('fields.email')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">{t('fields.email')}:</span>{' '}
              {client.email || '-'}
            </div>
            <div>
              <span className="text-muted-foreground">{t('fields.phone')}:</span>{' '}
              {client.phone || '-'}
            </div>
            <div>
              <span className="text-muted-foreground">{t('fields.pec')}:</span> {client.pec || '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('taxData')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">{t('fields.partitaIva')}:</span>{' '}
              {client.partitaIva || '-'}
            </div>
            <div>
              <span className="text-muted-foreground">{t('fields.codiceFiscale')}:</span>{' '}
              {client.codiceFiscale || '-'}
            </div>
            <div>
              <span className="text-muted-foreground">{t('fields.codiceDestinatario')}:</span>{' '}
              {client.codiceDestinatario || '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('fields.street')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div>{client.street || '-'}</div>
            <div>{[client.postalCode, client.city, client.province].filter(Boolean).join(' ')}</div>
            <div>{client.country}</div>
          </CardContent>
        </Card>

        {client.notes && (
          <Card>
            <CardHeader>
              <CardTitle>{t('fields.notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{client.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {client.invoices?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('recentInvoices')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('invoicesTable.number')}</TableHead>
                  <TableHead>{t('invoicesTable.date')}</TableHead>
                  <TableHead>{t('invoicesTable.status')}</TableHead>
                  <TableHead className="text-right">{t('invoicesTable.amount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.invoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Link to={`/invoices/${inv.id}`} className="font-medium hover:underline">
                        {inv.number}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(inv.issueDate)}</TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(inv.netPayable)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
