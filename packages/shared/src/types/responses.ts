import type { ClientType, InvoiceStatus } from './common';

// ── Client ──────────────────────────────────────────────────────────
export interface ClientResponse {
  id: string;
  userId: string;
  type: ClientType;
  name: string;
  email: string | null;
  phone: string | null;
  partitaIva: string | null;
  codiceFiscale: string | null;
  codiceDestinatario: string | null;
  pec: string | null;
  street: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDetailResponse extends ClientResponse {
  invoices: InvoiceListItem[];
}

// ── Invoice ─────────────────────────────────────────────────────────
export interface InvoiceItemResponse {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  amount: number;
  sortOrder: number;
}

export interface InvoiceListItem {
  id: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  grossTotal: number;
  netPayable: number;
  client: { id: string; name: string };
}

export interface InvoiceDetailResponse {
  id: string;
  userId: string;
  clientId: string;
  number: string;
  year: number;
  sequenceNumber: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  ivaRate: number;
  applyRitenuta: boolean;
  ritenutaRate: number;
  applyCassa: boolean;
  cassaRate: number;
  applyBollo: boolean;
  subtotal: number;
  cassaAmount: number;
  taxableBase: number;
  ivaAmount: number;
  bolloAmount: number;
  grossTotal: number;
  ritenutaAmount: number;
  netPayable: number;
  notes: string | null;
  paymentTerms: string | null;
  createdAt: string;
  updatedAt: string;
  client: ClientResponse;
  items: InvoiceItemResponse[];
}

// ── Settings ────────────────────────────────────────────────────────
export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  locale: string;
}

export interface BusinessProfileResponse {
  id: string;
  businessName: string;
  partitaIva: string | null;
  codiceFiscale: string | null;
  codiceDestinatario: string | null;
  pec: string | null;
  regimeFiscale: string | null;
  street: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  iban: string | null;
  logoUrl: string | null;
}

export interface UserSettingsResponse {
  id: string;
  defaultIvaRate: number;
  defaultApplyRitenuta: boolean;
  defaultRitenutaRate: number;
  defaultApplyCassa: boolean;
  defaultCassaRate: number;
  defaultApplyBollo: boolean;
  defaultPaymentTerms: string | null;
  invoicePrefix: string;
  theme: string;
  locale: string;
}
