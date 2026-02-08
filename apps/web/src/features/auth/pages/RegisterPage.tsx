import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerSchema, type RegisterInput } from '@devdash/shared';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { registerApi } from '../api';
import { toast } from 'sonner';

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { locale: 'it' },
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (data: RegisterInput) => {
    try {
      setError('');
      const result = await registerApi(data);
      setAuth(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      toast.success(t('register.success'));
      navigate('/');
    } catch (err: unknown) {
      const message = isAxiosError(err) ? err.response?.data?.error?.message : undefined;
      setError(message || t('register.failed'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('register.title')}</CardTitle>
          <CardDescription>{t('register.subtitle')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('register.firstName')}</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('register.lastName')}</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('register.email')}</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('register.password')}</Label>
              <Input id="password" type="password" {...register('password')} />
              <p className="text-xs text-muted-foreground">{t('register.passwordHint')}</p>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '...' : t('register.submit')}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t('register.hasAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {t('register.login')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
