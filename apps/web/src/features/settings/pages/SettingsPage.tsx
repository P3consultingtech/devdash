import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfileSchema, updateBusinessProfileSchema, updateUserSettingsSchema } from '@devdash/shared';
import type { UpdateProfileInput, UpdateBusinessProfileInput, UpdateUserSettingsInput } from '@devdash/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { getProfileApi, updateProfileApi, getBusinessProfileApi, updateBusinessProfileApi, getSettingsApi, updateSettingsApi, uploadLogoApi, deleteLogoApi } from '../api';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';

function ProfileTab() {
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfileApi });

  const { register, handleSubmit, reset } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    if (profile) reset({ firstName: profile.firstName, lastName: profile.lastName });
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setUser(data);
      toast.success(t('profile.saved'));
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>{t('profile.title')}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('profile.email')}</Label>
            <Input value={profile?.email || ''} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('profile.firstName')}</Label>
              <Input {...register('firstName')} />
            </div>
            <div className="space-y-2">
              <Label>{t('profile.lastName')}</Label>
              <Input {...register('lastName')} />
            </div>
          </div>
          <Button type="submit" disabled={mutation.isPending}>{tc('save')}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function BusinessTab() {
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: bp } = useQuery({ queryKey: ['business-profile'], queryFn: getBusinessProfileApi });

  const { register, handleSubmit, reset } = useForm<UpdateBusinessProfileInput>({
    resolver: zodResolver(updateBusinessProfileSchema),
  });

  useEffect(() => {
    if (bp) reset({
      businessName: bp.businessName || '',
      partitaIva: bp.partitaIva || '',
      codiceFiscale: bp.codiceFiscale || '',
      codiceDestinatario: bp.codiceDestinatario || '',
      pec: bp.pec || '',
      street: bp.street || '',
      city: bp.city || '',
      province: bp.province || '',
      postalCode: bp.postalCode || '',
      country: bp.country || 'IT',
      phone: bp.phone || '',
      email: bp.email || '',
      iban: bp.iban || '',
    });
  }, [bp, reset]);

  const mutation = useMutation({
    mutationFn: updateBusinessProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      toast.success(t('business.saved'));
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: uploadLogoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      toast.success(t('business.logoUploaded'));
    },
  });

  const deleteLogoMutation = useMutation({
    mutationFn: deleteLogoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      toast.success(t('business.logoDeleted'));
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogoMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card>
      <CardHeader><CardTitle>{t('business.title')}</CardTitle></CardHeader>
      <CardContent>
        {/* Logo Upload */}
        <div className="mb-6 space-y-2">
          <Label>{t('business.logo')}</Label>
          <div className="flex items-center gap-4">
            {bp?.logoUrl ? (
              <img
                src={bp.logoUrl}
                alt="Logo"
                className="h-16 w-16 rounded-md border object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted text-muted-foreground text-xs">
                Logo
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLogoMutation.isPending}
                >
                  {t('business.logoUpload')}
                </Button>
                {bp?.logoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => deleteLogoMutation.mutate()}
                    disabled={deleteLogoMutation.isPending}
                  >
                    {t('business.logoDelete')}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t('business.logoHint')}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.webp"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('business.businessName')}</Label>
            <Input {...register('businessName')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('business.partitaIva')}</Label>
              <Input {...register('partitaIva')} maxLength={11} />
            </div>
            <div className="space-y-2">
              <Label>{t('business.codiceFiscale')}</Label>
              <Input {...register('codiceFiscale')} maxLength={16} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('business.codiceDestinatario')}</Label>
              <Input {...register('codiceDestinatario')} maxLength={7} />
            </div>
            <div className="space-y-2">
              <Label>{t('business.pec')}</Label>
              <Input {...register('pec')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('business.street')}</Label>
            <Input {...register('street')} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('business.city')}</Label>
              <Input {...register('city')} />
            </div>
            <div className="space-y-2">
              <Label>{t('business.province')}</Label>
              <Input {...register('province')} maxLength={2} />
            </div>
            <div className="space-y-2">
              <Label>{t('business.postalCode')}</Label>
              <Input {...register('postalCode')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('business.phone')}</Label>
              <Input {...register('phone')} />
            </div>
            <div className="space-y-2">
              <Label>{t('business.email')}</Label>
              <Input {...register('email')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('business.iban')}</Label>
            <Input {...register('iban')} maxLength={34} />
          </div>
          <Button type="submit" disabled={mutation.isPending}>{tc('save')}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function InvoiceDefaultsTab() {
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ['user-settings'], queryFn: getSettingsApi });

  const { register, handleSubmit, reset } = useForm<UpdateUserSettingsInput>({
    resolver: zodResolver(updateUserSettingsSchema),
  });

  useEffect(() => {
    if (settings) reset({
      defaultIvaRate: settings.defaultIvaRate,
      defaultApplyRitenuta: settings.defaultApplyRitenuta,
      defaultRitenutaRate: settings.defaultRitenutaRate,
      defaultApplyCassa: settings.defaultApplyCassa,
      defaultCassaRate: settings.defaultCassaRate,
      defaultApplyBollo: settings.defaultApplyBollo,
      defaultPaymentTerms: settings.defaultPaymentTerms || '',
      invoicePrefix: settings.invoicePrefix || 'FT',
    });
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: updateSettingsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast.success(t('invoiceDefaults.saved'));
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>{t('invoiceDefaults.title')}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('invoiceDefaults.defaultIvaRate')}</Label>
              <Input type="number" step="0.01" {...register('defaultIvaRate', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t('invoiceDefaults.invoicePrefix')}</Label>
              <Input {...register('invoicePrefix')} maxLength={10} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('defaultApplyRitenuta')} className="rounded" />
            <Label>{t('invoiceDefaults.defaultApplyRitenuta')}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t('invoiceDefaults.defaultRitenutaRate')}</Label>
            <Input type="number" step="0.01" {...register('defaultRitenutaRate', { valueAsNumber: true })} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('defaultApplyCassa')} className="rounded" />
            <Label>{t('invoiceDefaults.defaultApplyCassa')}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t('invoiceDefaults.defaultCassaRate')}</Label>
            <Input type="number" step="0.01" {...register('defaultCassaRate', { valueAsNumber: true })} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('defaultApplyBollo')} className="rounded" />
            <Label>{t('invoiceDefaults.defaultApplyBollo')}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t('invoiceDefaults.defaultPaymentTerms')}</Label>
            <Input {...register('defaultPaymentTerms')} />
          </div>
          <Button type="submit" disabled={mutation.isPending}>{tc('save')}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AppearanceTab() {
  const { t } = useTranslation('settings');
  const { theme, setTheme } = useUiStore();

  const handleLanguageChange = (locale: string) => {
    i18n.changeLanguage(locale);
    localStorage.setItem('devdash-locale', locale);
  };

  return (
    <Card>
      <CardHeader><CardTitle>{t('appearance.title')}</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>{t('appearance.theme')}</Label>
          <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t('appearance.themes.light')}</SelectItem>
              <SelectItem value="dark">{t('appearance.themes.dark')}</SelectItem>
              <SelectItem value="system">{t('appearance.themes.system')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('appearance.language')}</Label>
          <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="it">{t('appearance.languages.it')}</SelectItem>
              <SelectItem value="en">{t('appearance.languages.en')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="business">{t('tabs.business')}</TabsTrigger>
          <TabsTrigger value="invoiceDefaults">{t('tabs.invoiceDefaults')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('tabs.appearance')}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="business"><BusinessTab /></TabsContent>
        <TabsContent value="invoiceDefaults"><InvoiceDefaultsTab /></TabsContent>
        <TabsContent value="appearance"><AppearanceTab /></TabsContent>
      </Tabs>
    </div>
  );
}
