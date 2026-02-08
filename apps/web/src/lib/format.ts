import i18n from './i18n';

export function formatCurrency(cents: number): string {
  const locale = i18n.language === 'it' ? 'it-IT' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

export function formatDate(date: string | Date): string {
  const locale = i18n.language === 'it' ? 'it-IT' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}
