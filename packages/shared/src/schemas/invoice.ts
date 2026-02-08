import { z } from 'zod';

export const invoiceStatusEnum = z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']);

export const invoiceItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive(),
  unitPriceCents: z.number().int().min(0),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(invoiceItemSchema).min(1),
  // Tax settings
  ivaRate: z.number().min(0).max(100).default(22),
  applyRitenuta: z.boolean().default(false),
  ritenutaRate: z.number().min(0).max(100).default(20),
  applyCassa: z.boolean().default(false),
  cassaRate: z.number().min(0).max(100).default(4),
  applyBollo: z.boolean().default(false),
  // Optional
  notes: z.string().max(2000).optional().or(z.literal('')),
  paymentTerms: z.string().max(500).optional().or(z.literal('')),
});

export const updateInvoiceSchema = createInvoiceSchema;

export const invoiceStatusTransitionSchema = z.object({
  status: invoiceStatusEnum,
});

export const invoiceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: invoiceStatusEnum.optional(),
  clientId: z.string().uuid().optional(),
  search: z.string().optional(),
  fromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  toDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  sortBy: z.enum(['number', 'issueDate', 'dueDate', 'status', 'netPayable']).default('issueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceStatusTransition = z.infer<typeof invoiceStatusTransitionSchema>;
export type InvoiceListQuery = z.infer<typeof invoiceListQuerySchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
