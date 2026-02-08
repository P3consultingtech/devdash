import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-xl font-semibold">{t('notFound.title')}</h2>
      <p className="text-muted-foreground max-w-md text-center">{t('notFound.message')}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          {t('back')}
        </Button>
        <Button onClick={() => navigate('/', { replace: true })}>{t('nav.dashboard')}</Button>
      </div>
    </div>
  );
}
