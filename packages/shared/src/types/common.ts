export type Locale = 'it' | 'en';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type ClientType = 'BUSINESS' | 'FREELANCER' | 'INDIVIDUAL';

export type RegimeFiscale =
  | 'RF01' // Ordinario
  | 'RF02' // Contribuenti minimi
  | 'RF04' // Agricoltura
  | 'RF05' // Pesca
  | 'RF06' // Commercio ambulante
  | 'RF07' // Asta
  | 'RF08' // Agriturismo
  | 'RF09' // Spettacoli
  | 'RF10' // Rivendita documenti
  | 'RF11' // Agenzie viaggio
  | 'RF12' // Agriturismo
  | 'RF13' // Vendite a domicilio
  | 'RF14' // Rivendita beni usati
  | 'RF15' // Agenzie gestione immobili
  | 'RF16' // IVA per cassa
  | 'RF17' // IVA per cassa P.A.
  | 'RF18' // Altro
  | 'RF19'; // Forfettario

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
