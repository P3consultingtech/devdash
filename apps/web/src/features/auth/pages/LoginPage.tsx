import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginSchema, type LoginInput } from '@devdash/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { loginApi } from '../api';

export function LoginPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (data: LoginInput) => {
    try {
      setError('');
      const result = await loginApi(data);
      setAuth(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t('login.invalidCredentials'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '...' : t('login.submit')}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="text-primary hover:underline">{t('login.register')}</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
