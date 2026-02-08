import { z } from 'zod';

export const regimeFiscaleEnum = z.enum([
  'RF01', 'RF02', 'RF04', 'RF05', 'RF06', 'RF07', 'RF08', 'RF09',
  'RF10', 'RF11', 'RF12', 'RF13', 'RF14', 'RF15', 'RF16', 'RF17', 'RF18', 'RF19',
]);

export const updateBusinessProfileSchema = z.object({
  businessName: z.string().min(1).max(255),
  partitaIva: z.string().regex(/^\d{11}$/, 'Must be 11 digits').optional().or(z.literal('')),
  codiceFiscale: z.string().max(16).optional().or(z.literal('')),
  codiceDestinatario: z.string().max(7).optional().or(z.literal('')),
  pec: z.string().email().optional().or(z.literal('')),
  regimeFiscale: regimeFiscaleEnum.optional(),
  street: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  province: z.string().max(2).optional().or(z.literal('')),
  postalCode: z.string().max(10).optional().or(z.literal('')),
  country: z.string().max(2).default('IT'),
  phone: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  iban: z.string().max(34).optional().or(z.literal('')),
});

export const updateUserSettingsSchema = z.object({
  defaultIvaRate: z.number().min(0).max(100).optional(),
  defaultApplyRitenuta: z.boolean().optional(),
  defaultRitenutaRate: z.number().min(0).max(100).optional(),
  defaultApplyCassa: z.boolean().optional(),
  defaultCassaRate: z.number().min(0).max(100).optional(),
  defaultApplyBollo: z.boolean().optional(),
  defaultPaymentTerms: z.string().max(500).optional().or(z.literal('')),
  invoicePrefix: z.string().max(10).default('FT'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  locale: z.enum(['it', 'en']).default('it'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  locale: z.enum(['it', 'en']).optional(),
});

export type UpdateBusinessProfileInput = z.infer<typeof updateBusinessProfileSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
