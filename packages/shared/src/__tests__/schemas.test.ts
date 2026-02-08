import { describe, it, expect } from 'vitest';
import {
  // Auth schemas
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  // Client schemas
  clientTypeEnum,
  createClientSchema,
  clientListQuerySchema,
  // Invoice schemas
  invoiceStatusEnum,
  invoiceItemSchema,
  createInvoiceSchema,
  invoiceStatusTransitionSchema,
  invoiceListQuerySchema,
  // Settings schemas
  regimeFiscaleEnum,
  updateBusinessProfileSchema,
  updateUserSettingsSchema,
  updateProfileSchema,
  // Dashboard schemas
  dashboardQuerySchema,
} from '../index';

// ============================= AUTH SCHEMAS ==================================

describe('loginSchema', () => {
  it('should accept valid login credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('should reject password longer than 128 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'a'.repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it('should accept password exactly 8 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '12345678',
    });
    expect(result.success).toBe(true);
  });

  it('should accept password exactly 128 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'a'.repeat(128),
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing email field', () => {
    const result = loginSchema.safeParse({
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing password field', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validRegister = {
    email: 'user@example.com',
    password: 'password123',
    firstName: 'Mario',
    lastName: 'Rossi',
  };

  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
  });

  it('should default locale to "it"', () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.locale).toBe('it');
    }
  });

  it('should accept locale "en"', () => {
    const result = registerSchema.safeParse({ ...validRegister, locale: 'en' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.locale).toBe('en');
    }
  });

  it('should reject invalid locale', () => {
    const result = registerSchema.safeParse({ ...validRegister, locale: 'fr' });
    expect(result.success).toBe(false);
  });

  it('should reject empty firstName', () => {
    const result = registerSchema.safeParse({ ...validRegister, firstName: '' });
    expect(result.success).toBe(false);
  });

  it('should reject firstName longer than 100 chars', () => {
    const result = registerSchema.safeParse({ ...validRegister, firstName: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('should reject empty lastName', () => {
    const result = registerSchema.safeParse({ ...validRegister, lastName: '' });
    expect(result.success).toBe(false);
  });

  it('should reject lastName longer than 100 chars', () => {
    const result = registerSchema.safeParse({ ...validRegister, lastName: 'B'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email in registration', () => {
    const result = registerSchema.safeParse({ ...validRegister, email: 'bad' });
    expect(result.success).toBe(false);
  });

  it('should reject short password in registration', () => {
    const result = registerSchema.safeParse({ ...validRegister, password: '1234567' });
    expect(result.success).toBe(false);
  });
});

describe('refreshTokenSchema', () => {
  it('should accept a valid refresh token', () => {
    const result = refreshTokenSchema.safeParse({ refreshToken: 'some-token-value' });
    expect(result.success).toBe(true);
  });

  it('should reject empty refresh token', () => {
    const result = refreshTokenSchema.safeParse({ refreshToken: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing refreshToken field', () => {
    const result = refreshTokenSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ============================= CLIENT SCHEMAS ===============================

describe('clientTypeEnum', () => {
  it('should accept BUSINESS', () => {
    expect(clientTypeEnum.safeParse('BUSINESS').success).toBe(true);
  });

  it('should accept FREELANCER', () => {
    expect(clientTypeEnum.safeParse('FREELANCER').success).toBe(true);
  });

  it('should accept INDIVIDUAL', () => {
    expect(clientTypeEnum.safeParse('INDIVIDUAL').success).toBe(true);
  });

  it('should reject invalid type', () => {
    expect(clientTypeEnum.safeParse('GOVERNMENT').success).toBe(false);
  });

  it('should reject lowercase', () => {
    expect(clientTypeEnum.safeParse('business').success).toBe(false);
  });
});

describe('createClientSchema', () => {
  const validBusinessClient = {
    type: 'BUSINESS' as const,
    name: 'Acme S.r.l.',
    partitaIva: '00000000000',
  };

  const validIndividualClient = {
    type: 'INDIVIDUAL' as const,
    name: 'Mario Rossi',
  };

  it('should accept a valid business client with P.IVA', () => {
    const result = createClientSchema.safeParse(validBusinessClient);
    expect(result.success).toBe(true);
  });

  it('should accept a valid individual client without P.IVA', () => {
    const result = createClientSchema.safeParse(validIndividualClient);
    expect(result.success).toBe(true);
  });

  it('should reject a business client without P.IVA', () => {
    const result = createClientSchema.safeParse({
      type: 'BUSINESS',
      name: 'Acme S.r.l.',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pivaError = result.error.issues.find((i) => i.path.includes('partitaIva'));
      expect(pivaError).toBeDefined();
    }
  });

  it('should reject a freelancer client without P.IVA', () => {
    const result = createClientSchema.safeParse({
      type: 'FREELANCER',
      name: 'Freelancer Name',
    });
    expect(result.success).toBe(false);
  });

  it('should accept an individual client without P.IVA', () => {
    const result = createClientSchema.safeParse({
      type: 'INDIVIDUAL',
      name: 'Mario Rossi',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject name longer than 255 characters', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      name: 'X'.repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional email as valid email', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      email: 'info@acme.it',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional email as empty string', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      email: '',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional phone', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      phone: '+39 02 1234567',
    });
    expect(result.success).toBe(true);
  });

  it('should reject phone longer than 30 characters', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      phone: '1'.repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it('should validate P.IVA must be exactly 11 digits', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      partitaIva: '1234',
    });
    expect(result.success).toBe(false);
  });

  it('should accept empty string for P.IVA on individual clients', () => {
    const result = createClientSchema.safeParse({
      ...validIndividualClient,
      partitaIva: '',
    });
    expect(result.success).toBe(true);
  });

  it('should accept PEC as valid email', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      pec: 'info@pec.acme.it',
    });
    expect(result.success).toBe(true);
  });

  it('should accept codice destinatario up to 7 characters', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      codiceDestinatario: '0000000',
    });
    expect(result.success).toBe(true);
  });

  it('should reject codice destinatario longer than 7 characters', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      codiceDestinatario: '12345678',
    });
    expect(result.success).toBe(false);
  });

  it('should default country to IT', () => {
    const result = createClientSchema.safeParse(validBusinessClient);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe('IT');
    }
  });

  it('should accept province as 2-letter code', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      province: 'MI',
    });
    expect(result.success).toBe(true);
  });

  it('should reject province longer than 2 characters', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      province: 'MIL',
    });
    expect(result.success).toBe(false);
  });

  it('should accept notes up to 1000 characters', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      notes: 'Some notes about the client',
    });
    expect(result.success).toBe(true);
  });

  it('should reject notes longer than 1000 characters', () => {
    const result = createClientSchema.safeParse({
      ...validBusinessClient,
      notes: 'N'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe('clientListQuerySchema', () => {
  it('should accept empty object with defaults', () => {
    const result = clientListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe('name');
      expect(result.data.sortOrder).toBe('asc');
    }
  });

  it('should accept valid query parameters', () => {
    const result = clientListQuerySchema.safeParse({
      page: 2,
      limit: 50,
      search: 'Acme',
      type: 'BUSINESS',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(result.success).toBe(true);
  });

  it('should coerce string page to number', () => {
    const result = clientListQuerySchema.safeParse({ page: '3' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it('should reject page less than 1', () => {
    const result = clientListQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject limit greater than 100', () => {
    const result = clientListQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('should reject invalid sortBy value', () => {
    const result = clientListQuerySchema.safeParse({ sortBy: 'email' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid sortOrder value', () => {
    const result = clientListQuerySchema.safeParse({ sortOrder: 'random' });
    expect(result.success).toBe(false);
  });
});

// ============================= INVOICE SCHEMAS ==============================

describe('invoiceStatusEnum', () => {
  it.each(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'] as const)(
    'should accept status "%s"',
    (status) => {
      expect(invoiceStatusEnum.safeParse(status).success).toBe(true);
    },
  );

  it('should reject invalid status', () => {
    expect(invoiceStatusEnum.safeParse('PENDING').success).toBe(false);
  });

  it('should reject lowercase status', () => {
    expect(invoiceStatusEnum.safeParse('draft').success).toBe(false);
  });
});

describe('invoiceItemSchema', () => {
  it('should accept a valid invoice item', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Consulting services',
      quantity: 10,
      unitPriceCents: 5000,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty description', () => {
    const result = invoiceItemSchema.safeParse({
      description: '',
      quantity: 1,
      unitPriceCents: 1000,
    });
    expect(result.success).toBe(false);
  });

  it('should reject description longer than 500 characters', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'D'.repeat(501),
      quantity: 1,
      unitPriceCents: 1000,
    });
    expect(result.success).toBe(false);
  });

  it('should reject zero quantity', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Item',
      quantity: 0,
      unitPriceCents: 1000,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative quantity', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Item',
      quantity: -1,
      unitPriceCents: 1000,
    });
    expect(result.success).toBe(false);
  });

  it('should accept fractional quantity', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Hours of work',
      quantity: 1.5,
      unitPriceCents: 5000,
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative unitPriceCents', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Item',
      quantity: 1,
      unitPriceCents: -100,
    });
    expect(result.success).toBe(false);
  });

  it('should accept zero unitPriceCents', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Free item',
      quantity: 1,
      unitPriceCents: 0,
    });
    expect(result.success).toBe(true);
  });

  it('should reject non-integer unitPriceCents', () => {
    const result = invoiceItemSchema.safeParse({
      description: 'Item',
      quantity: 1,
      unitPriceCents: 10.5,
    });
    expect(result.success).toBe(false);
  });
});

describe('createInvoiceSchema', () => {
  const validInvoice = {
    clientId: '550e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    items: [{ description: 'Service', quantity: 1, unitPriceCents: 10000 }],
  };

  it('should accept a valid invoice with defaults', () => {
    const result = createInvoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ivaRate).toBe(22);
      expect(result.data.applyRitenuta).toBe(false);
      expect(result.data.ritenutaRate).toBe(20);
      expect(result.data.applyCassa).toBe(false);
      expect(result.data.cassaRate).toBe(4);
      expect(result.data.applyBollo).toBe(false);
    }
  });

  it('should reject invalid clientId (not UUID)', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      clientId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format for issueDate', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      issueDate: '15/01/2026',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format for dueDate', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      dueDate: '2026-1-15',
    });
    expect(result.success).toBe(false);
  });

  it('should require at least one item', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it('should accept multiple items', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      items: [
        { description: 'Service A', quantity: 1, unitPriceCents: 5000 },
        { description: 'Service B', quantity: 2, unitPriceCents: 3000 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should reject IVA rate above 100', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      ivaRate: 101,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative IVA rate', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      ivaRate: -1,
    });
    expect(result.success).toBe(false);
  });

  it('should accept IVA rate of 0', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      ivaRate: 0,
    });
    expect(result.success).toBe(true);
  });

  it('should accept custom ritenuta rate', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      applyRitenuta: true,
      ritenutaRate: 23,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ritenutaRate).toBe(23);
    }
  });

  it('should accept optional notes', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      notes: 'Payment via bank transfer',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty string for notes', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      notes: '',
    });
    expect(result.success).toBe(true);
  });

  it('should reject notes longer than 2000 characters', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      notes: 'N'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional paymentTerms', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      paymentTerms: 'Bonifico bancario entro 30 giorni',
    });
    expect(result.success).toBe(true);
  });

  it('should reject paymentTerms longer than 500 characters', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      paymentTerms: 'P'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('invoiceStatusTransitionSchema', () => {
  it('should accept valid status', () => {
    const result = invoiceStatusTransitionSchema.safeParse({ status: 'PAID' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = invoiceStatusTransitionSchema.safeParse({ status: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('should reject missing status', () => {
    const result = invoiceStatusTransitionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('invoiceListQuerySchema', () => {
  it('should accept empty object with defaults', () => {
    const result = invoiceListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe('issueDate');
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('should accept full query parameters', () => {
    const result = invoiceListQuerySchema.safeParse({
      page: 2,
      limit: 50,
      status: 'PAID',
      clientId: '550e8400-e29b-41d4-a716-446655440000',
      search: 'consulting',
      fromDate: '2026-01-01',
      toDate: '2026-12-31',
      sortBy: 'netPayable',
      sortOrder: 'asc',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid clientId format', () => {
    const result = invoiceListQuerySchema.safeParse({
      clientId: 'not-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format for fromDate', () => {
    const result = invoiceListQuerySchema.safeParse({
      fromDate: '01-01-2026',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format for toDate', () => {
    const result = invoiceListQuerySchema.safeParse({
      toDate: '2026/12/31',
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid sortBy values', () => {
    const validSortBy = ['number', 'issueDate', 'dueDate', 'status', 'netPayable'];
    for (const sortBy of validSortBy) {
      const result = invoiceListQuerySchema.safeParse({ sortBy });
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid sortBy', () => {
    const result = invoiceListQuerySchema.safeParse({ sortBy: 'amount' });
    expect(result.success).toBe(false);
  });

  it('should coerce string limit to number', () => {
    const result = invoiceListQuerySchema.safeParse({ limit: '25' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
    }
  });
});

// ============================= SETTINGS SCHEMAS =============================

describe('regimeFiscaleEnum', () => {
  it('should accept RF01 (Ordinario)', () => {
    expect(regimeFiscaleEnum.safeParse('RF01').success).toBe(true);
  });

  it('should accept RF19 (Forfettario)', () => {
    expect(regimeFiscaleEnum.safeParse('RF19').success).toBe(true);
  });

  it('should reject invalid regime code', () => {
    expect(regimeFiscaleEnum.safeParse('RF00').success).toBe(false);
  });

  it('should reject RF03 (not in the enum)', () => {
    expect(regimeFiscaleEnum.safeParse('RF03').success).toBe(false);
  });

  it('should reject lowercase', () => {
    expect(regimeFiscaleEnum.safeParse('rf01').success).toBe(false);
  });
});

describe('updateBusinessProfileSchema', () => {
  it('should accept valid business profile', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: 'Studio Rossi',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty business name', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject business name longer than 255 chars', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: 'B'.repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid P.IVA in business profile', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: 'Studio Rossi',
      partitaIva: '00000000000',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid P.IVA format in business profile', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: 'Studio Rossi',
      partitaIva: '123',
    });
    expect(result.success).toBe(false);
  });

  it('should accept empty string for P.IVA', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: 'Studio Rossi',
      partitaIva: '',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid PEC email', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: 'Studio Rossi',
      pec: 'studio@pec.it',
    });
    expect(result.success).toBe(true);
  });

  it('should accept regimeFiscale', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: 'Studio Rossi',
      regimeFiscale: 'RF19',
    });
    expect(result.success).toBe(true);
  });

  it('should accept IBAN up to 34 characters', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: 'Studio Rossi',
      iban: 'IT60X0542811101000000123456',
    });
    expect(result.success).toBe(true);
  });

  it('should reject IBAN longer than 34 characters', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: 'Studio Rossi',
      iban: 'I'.repeat(35),
    });
    expect(result.success).toBe(false);
  });

  it('should default country to IT', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: 'Studio Rossi',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe('IT');
    }
  });

  it('should accept all optional address fields', () => {
    const result = updateBusinessProfileSchema.safeParse({
      businessName: 'Studio Rossi',
      street: 'Via Roma 1',
      city: 'Milano',
      province: 'MI',
      postalCode: '20100',
      country: 'IT',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateUserSettingsSchema', () => {
  it('should accept empty object with defaults', () => {
    const result = updateUserSettingsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invoicePrefix).toBe('FT');
      expect(result.data.theme).toBe('system');
      expect(result.data.locale).toBe('it');
    }
  });

  it('should accept valid tax settings', () => {
    const result = updateUserSettingsSchema.safeParse({
      defaultIvaRate: 22,
      defaultApplyRitenuta: true,
      defaultRitenutaRate: 20,
      defaultApplyCassa: true,
      defaultCassaRate: 4,
      defaultApplyBollo: false,
    });
    expect(result.success).toBe(true);
  });

  it('should reject IVA rate above 100', () => {
    const result = updateUserSettingsSchema.safeParse({
      defaultIvaRate: 101,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative IVA rate', () => {
    const result = updateUserSettingsSchema.safeParse({
      defaultIvaRate: -1,
    });
    expect(result.success).toBe(false);
  });

  it('should accept theme values', () => {
    for (const theme of ['light', 'dark', 'system']) {
      const result = updateUserSettingsSchema.safeParse({ theme });
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid theme', () => {
    const result = updateUserSettingsSchema.safeParse({ theme: 'purple' });
    expect(result.success).toBe(false);
  });

  it('should accept locale values', () => {
    for (const locale of ['it', 'en']) {
      const result = updateUserSettingsSchema.safeParse({ locale });
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid locale', () => {
    const result = updateUserSettingsSchema.safeParse({ locale: 'de' });
    expect(result.success).toBe(false);
  });

  it('should accept invoice prefix up to 10 characters', () => {
    const result = updateUserSettingsSchema.safeParse({
      invoicePrefix: 'INV',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invoice prefix longer than 10 characters', () => {
    const result = updateUserSettingsSchema.safeParse({
      invoicePrefix: 'P'.repeat(11),
    });
    expect(result.success).toBe(false);
  });

  it('should accept payment terms up to 500 characters', () => {
    const result = updateUserSettingsSchema.safeParse({
      defaultPaymentTerms: 'Bonifico bancario 30gg',
    });
    expect(result.success).toBe(true);
  });

  it('should reject payment terms longer than 500 characters', () => {
    const result = updateUserSettingsSchema.safeParse({
      defaultPaymentTerms: 'T'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('should accept valid profile data', () => {
    const result = updateProfileSchema.safeParse({
      firstName: 'Mario',
      lastName: 'Rossi',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty firstName', () => {
    const result = updateProfileSchema.safeParse({
      firstName: '',
      lastName: 'Rossi',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty lastName', () => {
    const result = updateProfileSchema.safeParse({
      firstName: 'Mario',
      lastName: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject firstName longer than 100 chars', () => {
    const result = updateProfileSchema.safeParse({
      firstName: 'M'.repeat(101),
      lastName: 'Rossi',
    });
    expect(result.success).toBe(false);
  });

  it('should reject lastName longer than 100 chars', () => {
    const result = updateProfileSchema.safeParse({
      firstName: 'Mario',
      lastName: 'R'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional locale', () => {
    const result = updateProfileSchema.safeParse({
      firstName: 'Mario',
      lastName: 'Rossi',
      locale: 'en',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid locale in profile', () => {
    const result = updateProfileSchema.safeParse({
      firstName: 'Mario',
      lastName: 'Rossi',
      locale: 'fr',
    });
    expect(result.success).toBe(false);
  });
});

// ============================= DASHBOARD SCHEMAS ============================

describe('dashboardQuerySchema', () => {
  it('should accept empty object', () => {
    const result = dashboardQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept valid year', () => {
    const result = dashboardQuerySchema.safeParse({ year: 2026 });
    expect(result.success).toBe(true);
  });

  it('should coerce string year to number', () => {
    const result = dashboardQuerySchema.safeParse({ year: '2026' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe(2026);
    }
  });

  it('should reject year below 2020', () => {
    const result = dashboardQuerySchema.safeParse({ year: 2019 });
    expect(result.success).toBe(false);
  });

  it('should reject year above 2100', () => {
    const result = dashboardQuerySchema.safeParse({ year: 2101 });
    expect(result.success).toBe(false);
  });

  it('should accept boundary year 2020', () => {
    const result = dashboardQuerySchema.safeParse({ year: 2020 });
    expect(result.success).toBe(true);
  });

  it('should accept boundary year 2100', () => {
    const result = dashboardQuerySchema.safeParse({ year: 2100 });
    expect(result.success).toBe(true);
  });

  it('should reject non-integer year', () => {
    const result = dashboardQuerySchema.safeParse({ year: 2026.5 });
    expect(result.success).toBe(false);
  });
});
