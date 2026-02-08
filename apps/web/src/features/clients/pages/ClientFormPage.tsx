import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientSchema, type CreateClientInput, type ClientType } from '@devdash/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClientApi, updateClientApi, getClientApi } from '../api';
import { toast } from 'sonner';

export function ClientFormPage() {
  const { t } = useTranslation('clients');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEditing = !!id;

  const { data: client } = useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientApi(id!),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: { type: 'BUSINESS', country: 'IT' },
  });

  const clientType = watch('type');

  useEffect(() => {
    if (client) {
      reset({
        type: client.type,
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        partitaIva: client.partitaIva || '',
        codiceFiscale: client.codiceFiscale || '',
        codiceDestinatario: client.codiceDestinatario || '',
        pec: client.pec || '',
        street: client.street || '',
        city: client.city || '',
        province: client.province || '',
        postalCode: client.postalCode || '',
        country: client.country || 'IT',
        notes: client.notes || '',
      });
    }
  }, [client, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateClientInput) =>
      isEditing ? updateClientApi(id!, data) : createClientApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(isEditing ? t('updated') : t('created'));
      navigate('/clients');
    },
    onError: () => toast.error(t('saveError')),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isEditing ? t('editClient') : t('addClient')}</h1>

      <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('fields.name')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('fields.type')}</Label>
                <Select value={clientType} onValueChange={(v) => setValue('type', v as ClientType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUSINESS">{t('types.BUSINESS')}</SelectItem>
                    <SelectItem value="FREELANCER">{t('types.FREELANCER')}</SelectItem>
                    <SelectItem value="INDIVIDUAL">{t('types.INDIVIDUAL')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('fields.name')}</Label>
                <Input {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('fields.email')}</Label>
                <Input type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('fields.phone')}</Label>
                <Input {...register('phone')} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('taxData')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(clientType === 'BUSINESS' || clientType === 'FREELANCER') && (
                <div className="space-y-2">
                  <Label>{t('fields.partitaIva')}</Label>
                  <Input {...register('partitaIva')} maxLength={11} />
                  {errors.partitaIva && (
                    <p className="text-xs text-destructive">{errors.partitaIva.message}</p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label>{t('fields.codiceFiscale')}</Label>
                <Input {...register('codiceFiscale')} maxLength={16} />
                {errors.codiceFiscale && (
                  <p className="text-xs text-destructive">{errors.codiceFiscale.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t('fields.codiceDestinatario')}</Label>
                <Input {...register('codiceDestinatario')} maxLength={7} />
                {errors.codiceDestinatario && (
                  <p className="text-xs text-destructive">{errors.codiceDestinatario.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t('fields.pec')}</Label>
                <Input type="email" {...register('pec')} />
                {errors.pec && <p className="text-xs text-destructive">{errors.pec.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('fields.street')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('fields.street')}</Label>
                <Input {...register('street')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('fields.city')}</Label>
                  <Input {...register('city')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('fields.province')}</Label>
                  <Input {...register('province')} maxLength={2} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('fields.postalCode')}</Label>
                  <Input {...register('postalCode')} maxLength={10} />
                </div>
                <div className="space-y-2">
                  <Label>{t('fields.country')}</Label>
                  <Input {...register('country')} maxLength={2} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('fields.notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea {...register('notes')} rows={4} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex gap-4">
          <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
            {tc('save')}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/clients')}>
            {tc('cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}
