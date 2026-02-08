import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { InvoiceStatus } from '@devdash/shared';

const statusVariantMap: Record<InvoiceStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  DRAFT: 'secondary',
  SENT: 'default',
  PAID: 'success',
  OVERDUE: 'warning',
  CANCELLED: 'destructive',
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslation('invoices');
  return <Badge variant={statusVariantMap[status]}>{t(`status.${status}`)}</Badge>;
}
