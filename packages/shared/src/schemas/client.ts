import { z } from 'zod';

export const clientTypeEnum = z.enum(['BUSINESS', 'FREELANCER', 'INDIVIDUAL']);

export const createClientSchema = z
  .object({
    type: clientTypeEnum,
    name: z.string().min(1).max(255),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().max(30).optional().or(z.literal('')),
    // Italian fiscal fields
    partitaIva: z
      .string()
      .regex(/^\d{11}$/, 'Must be 11 digits')
      .optional()
      .or(z.literal('')),
    codiceFiscale: z
      .string()
      .max(16)
      .optional()
      .or(z.literal('')),
    codiceDestinatario: z
      .string()
      .max(7)
      .optional()
      .or(z.literal('')),
    pec: z.string().email().optional().or(z.literal('')),
    // Address
    street: z.string().max(255).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    province: z.string().max(2).optional().or(z.literal('')),
    postalCode: z.string().max(10).optional().or(z.literal('')),
    country: z.string().max(2).default('IT'),
    notes: z.string().max(1000).optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // Business and Freelancer require P.IVA
      if ((data.type === 'BUSINESS' || data.type === 'FREELANCER') && !data.partitaIva) {
        return false;
      }
      return true;
    },
    { message: 'P.IVA is required for business and freelancer clients', path: ['partitaIva'] },
  );

export const updateClientSchema = createClientSchema;

export const clientListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: clientTypeEnum.optional(),
  sortBy: z.enum(['name', 'createdAt', 'type']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientListQuery = z.infer<typeof clientListQuerySchema>;
