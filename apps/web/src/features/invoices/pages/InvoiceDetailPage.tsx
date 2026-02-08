import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
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
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/format';
import { DetailSkeleton } from '@/components/shared/DetailSkeleton';
import { useAuthStore } from '@/stores/auth-store';
import {
  getInvoiceApi,
  deleteInvoiceApi,
  updateInvoiceStatusApi,
  duplicateInvoiceApi,
} from '../api';
import { toast } from 'sonner';
import type { InvoiceStatus } from '@devdash/shared';

export function InvoiceDetailPage() {
  const { t } = useTranslation('invoices');
  const { t: tc } = useTranslation('common');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceApi(id!),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInvoiceApi(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(t('deleted'));
      navigate('/invoices');
    },
    onError: () => toast.error(t('deleteError')),
  });

  const statusMutation = useMutation({
    mutationFn: (status: InvoiceStatus) => updateInvoiceStatusApi(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(t('statusUpdated'));
    },
    onError: () => toast.error(t('statusError')),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => duplicateInvoiceApi(id!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(t('duplicated'));
      navigate(`/invoices/${data.id}`);
    },
    onError: () => toast.error(t('duplicateError')),
  });

  const handleDownloadPdf = async () => {
    try {
      const res = await fetch(`/api/v1/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(res.statusText);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice?.number.replace('/', '-') ?? 'invoice'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t('downloadError'));
    }
  };

  if (isLoading) return <DetailSkeleton />;
  if (!invoice)
    return <div className="py-10 text-center text-muted-foreground">{tc('noResults')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          aria-label={tc('back')}
          onClick={() => navigate('/invoices')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{invoice.number}</h1>
        <StatusBadge status={invoice.status} />
        <div className="ml-auto flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4" /> {t('downloadPdf')}
          </Button>
          <Button variant="outline" onClick={() => duplicateMutation.mutate()}>
            <Copy className="h-4 w-4" /> {t('duplicate')}
          </Button>
          {invoice.status === 'DRAFT' && (
            <>
              <Link to={`/invoices/${id}/edit`}>
                <Button variant="outline">
                  <Pencil className="h-4 w-4" /> {tc('edit')}
                </Button>
              </Link>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4" />
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
            </>
          )}
        </div>
      </div>

      {/* Status Actions */}
      <Card>
        <CardContent className="pt-6 flex gap-2 flex-wrap">
          {invoice.status === 'DRAFT' && (
            <Button size="sm" onClick={() => statusMutation.mutate('SENT')}>
              {t('statusActions.markSent')}
            </Button>
          )}
          {invoice.status === 'SENT' && (
            <>
              <Button size="sm" onClick={() => statusMutation.mutate('PAID')}>
                {t('statusActions.markPaid')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => statusMutation.mutate('OVERDUE')}>
                {t('statusActions.markOverdue')}
              </Button>
            </>
          )}
          {invoice.status === 'OVERDUE' && (
            <Button size="sm" onClick={() => statusMutation.mutate('PAID')}>
              {t('statusActions.markPaid')}
            </Button>
          )}
          {['DRAFT', 'SENT', 'OVERDUE'].includes(invoice.status) && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => statusMutation.mutate('CANCELLED')}
            >
              {t('statusActions.markCancelled')}
            </Button>
          )}
          {invoice.status === 'CANCELLED' && (
            <Button size="sm" variant="outline" onClick={() => statusMutation.mutate('DRAFT')}>
              {t('revertToDraft')}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Client info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('fields.client')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{invoice.client.name}</p>
              {invoice.client.street && <p>{invoice.client.street}</p>}
              {invoice.client.city && (
                <p>
                  {[invoice.client.postalCode, invoice.client.city, invoice.client.province]
                    .filter(Boolean)
                    .join(' ')}
                </p>
              )}
              {invoice.client.partitaIva && <p>P.IVA: {invoice.client.partitaIva}</p>}
              {invoice.client.codiceFiscale && <p>C.F.: {invoice.client.codiceFiscale}</p>}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>{t('items.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('items.description')}</TableHead>
                    <TableHead className="text-right">{t('items.quantity')}</TableHead>
                    <TableHead className="text-right">{t('items.unitPrice')}</TableHead>
                    <TableHead className="text-right">{t('items.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPriceCents)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>{t('summary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{t('fields.issueDate')}</span>
              <span>{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{t('fields.dueDate')}</span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span>{t('fields.subtotal')}</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.applyCassa && invoice.cassaAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>
                  {t('fields.cassaAmount')} ({invoice.cassaRate}%)
                </span>
                <span>{formatCurrency(invoice.cassaAmount)}</span>
              </div>
            )}
            {invoice.ivaAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>IVA ({invoice.ivaRate}%)</span>
                <span>{formatCurrency(invoice.ivaAmount)}</span>
              </div>
            )}
            {invoice.applyBollo && invoice.bolloAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('fields.bolloAmount')}</span>
                <span>{formatCurrency(invoice.bolloAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>{t('fields.grossTotal')}</span>
              <span>{formatCurrency(invoice.grossTotal)}</span>
            </div>
            {invoice.applyRitenuta && invoice.ritenutaAmount > 0 && (
              <>
                <div className="flex justify-between text-sm text-destructive">
                  <span>
                    {t('fields.ritenutaAmount')} ({invoice.ritenutaRate}%)
                  </span>
                  <span>-{formatCurrency(invoice.ritenutaAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('fields.netPayable')}</span>
                  <span>{formatCurrency(invoice.netPayable)}</span>
                </div>
              </>
            )}
            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-1">{t('fields.notes')}</p>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              </>
            )}
            {invoice.paymentTerms && (
              <div>
                <p className="text-sm font-medium mb-1">{t('fields.paymentTerms')}</p>
                <p className="text-sm text-muted-foreground">{invoice.paymentTerms}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
