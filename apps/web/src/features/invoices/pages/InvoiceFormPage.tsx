import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import {
  createInvoiceSchema,
  type CreateInvoiceInput,
  calculateInvoice,
  formatCurrency,
} from '@devdash/shared';
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
import { Separator } from '@/components/ui/separator';
import { listClientsApi } from '@/features/clients/api';
import { createInvoiceApi, updateInvoiceApi, getInvoiceApi } from '../api';
import { formatDateISO } from '@/lib/format';
import { toast } from 'sonner';

export function InvoiceFormPage() {
  const { t } = useTranslation('invoices');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isEditing = !!id;

  const { data: existingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceApi(id!),
    enabled: isEditing,
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients', { limit: 100 }],
    queryFn: () => listClientsApi({ limit: 100 }),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unitPriceCents: 0 }],
      ivaRate: 22,
      applyRitenuta: false,
      ritenutaRate: 20,
      applyCassa: false,
      cassaRate: 4,
      applyBollo: false,
      issueDate: formatDateISO(new Date()),
      dueDate: formatDateISO(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (existingInvoice) {
      reset({
        clientId: existingInvoice.clientId,
        issueDate: formatDateISO(new Date(existingInvoice.issueDate)),
        dueDate: formatDateISO(new Date(existingInvoice.dueDate)),
        items: existingInvoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
        })),
        ivaRate: existingInvoice.ivaRate,
        applyRitenuta: existingInvoice.applyRitenuta,
        ritenutaRate: existingInvoice.ritenutaRate,
        applyCassa: existingInvoice.applyCassa,
        cassaRate: existingInvoice.cassaRate,
        applyBollo: existingInvoice.applyBollo,
        notes: existingInvoice.notes || '',
        paymentTerms: existingInvoice.paymentTerms || '',
      });
    }
  }, [existingInvoice, reset]);

  const watchedItems = watch('items');
  const ivaRate = watch('ivaRate');
  const applyRitenuta = watch('applyRitenuta');
  const ritenutaRate = watch('ritenutaRate');
  const applyCassa = watch('applyCassa');
  const cassaRate = watch('cassaRate');
  const applyBollo = watch('applyBollo');

  const calc = useMemo(() => {
    return calculateInvoice({
      items: (watchedItems || []).map((i) => ({
        quantity: Number(i.quantity) || 0,
        unitPriceCents: Number(i.unitPriceCents) || 0,
      })),
      ivaRate: Number(ivaRate) || 0,
      applyRitenuta: !!applyRitenuta,
      ritenutaRate: Number(ritenutaRate) || 0,
      applyCassa: !!applyCassa,
      cassaRate: Number(cassaRate) || 0,
      applyBollo: !!applyBollo,
    });
  }, [watchedItems, ivaRate, applyRitenuta, ritenutaRate, applyCassa, cassaRate, applyBollo]);

  const createMutation = useMutation({
    mutationFn: (data: CreateInvoiceInput) =>
      isEditing ? updateInvoiceApi(id!, data) : createInvoiceApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(isEditing ? t('updated') : t('created'));
      navigate('/invoices');
    },
    onError: () => toast.error(tc('error')),
  });

  const clients = clientsData?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isEditing ? t('editInvoice') : t('addInvoice')}</h1>

      <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Dates */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>{t('fields.client')}</Label>
                  <Select
                    value={watch('clientId') || ''}
                    onValueChange={(v) => setValue('clientId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectClient')} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.clientId && (
                    <p className="text-xs text-destructive">{errors.clientId.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('fields.issueDate')}</Label>
                    <Input type="date" {...register('issueDate')} />
                    {errors.issueDate && (
                      <p className="text-xs text-destructive">{errors.issueDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t('fields.dueDate')}</Label>
                    <Input type="date" {...register('dueDate')} />
                    {errors.dueDate && (
                      <p className="text-xs text-destructive">{errors.dueDate.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>{t('items.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-start">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder={t('items.description')}
                        {...register(`items.${index}.description`)}
                      />
                      {errors.items?.[index]?.description && (
                        <p className="text-xs text-destructive">
                          {errors.items[index].description.message}
                        </p>
                      )}
                    </div>
                    <div className="w-20 space-y-1">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={t('items.quantity')}
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <Input
                        type="number"
                        step="1"
                        placeholder={t('unitPriceCents')}
                        {...register(`items.${index}.unitPriceCents`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="w-28 pt-2 text-sm text-right font-medium">
                      {formatCurrency(
                        Math.round(
                          (Number(watchedItems?.[index]?.quantity) || 0) *
                            (Number(watchedItems?.[index]?.unitPriceCents) || 0),
                        ),
                        'it',
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={tc('delete')}
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ description: '', quantity: 1, unitPriceCents: 0 })}
                >
                  <Plus className="h-4 w-4" /> {t('items.addItem')}
                </Button>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>{t('fields.notes')}</Label>
                  <Textarea {...register('notes')} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>{t('fields.paymentTerms')}</Label>
                  <Input {...register('paymentTerms')} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tax Settings & Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('taxSettings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('fields.ivaRate')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('ivaRate', { valueAsNumber: true })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="applyRitenuta"
                    {...register('applyRitenuta')}
                    className="rounded"
                  />
                  <Label htmlFor="applyRitenuta">{t('taxOptions.applyRitenuta')}</Label>
                </div>
                {applyRitenuta && (
                  <div className="space-y-2">
                    <Label>{t('fields.ritenutaRate')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('ritenutaRate', { valueAsNumber: true })}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="applyCassa"
                    {...register('applyCassa')}
                    className="rounded"
                  />
                  <Label htmlFor="applyCassa">{t('taxOptions.applyCassa')}</Label>
                </div>
                {applyCassa && (
                  <div className="space-y-2">
                    <Label>{t('fields.cassaRate')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('cassaRate', { valueAsNumber: true })}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="applyBollo"
                    {...register('applyBollo')}
                    className="rounded"
                  />
                  <Label htmlFor="applyBollo">{t('taxOptions.applyBollo')}</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{t('fields.subtotal')}</span>
                  <span className="font-medium">{formatCurrency(calc.subtotal, 'it')}</span>
                </div>
                {applyCassa && (
                  <div className="flex justify-between text-sm">
                    <span>{t('fields.cassaAmount')}</span>
                    <span>{formatCurrency(calc.cassaAmount, 'it')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>{t('fields.ivaAmount')}</span>
                  <span>{formatCurrency(calc.ivaAmount, 'it')}</span>
                </div>
                {applyBollo && (
                  <div className="flex justify-between text-sm">
                    <span>{t('fields.bolloAmount')}</span>
                    <span>{formatCurrency(calc.bolloAmount, 'it')}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>{t('fields.grossTotal')}</span>
                  <span>{formatCurrency(calc.grossTotal, 'it')}</span>
                </div>
                {applyRitenuta && (
                  <>
                    <div className="flex justify-between text-sm text-destructive">
                      <span>{t('fields.ritenutaAmount')}</span>
                      <span>-{formatCurrency(calc.ritenutaAmount, 'it')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t('fields.netPayable')}</span>
                      <span>{formatCurrency(calc.netPayable, 'it')}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || createMutation.isPending}
              >
                {tc('save')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/invoices')}>
                {tc('cancel')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
