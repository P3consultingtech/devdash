/**
 * Italian tax calculation utilities.
 * All amounts are in cents (integer) to avoid floating point errors.
 * Example: 12350 = EUR 123.50
 */

export interface InvoiceCalculation {
  /** Sum of all line items (quantity * unitPrice) */
  subtotal: number;
  /** Cassa previdenziale amount (e.g. 4% of subtotal) */
  cassaAmount: number;
  /** Taxable base = subtotal + cassaAmount */
  taxableBase: number;
  /** IVA amount */
  ivaAmount: number;
  /** Bollo virtuale (EUR 2.00 = 200 cents, if applicable) */
  bolloAmount: number;
  /** Gross total = taxableBase + ivaAmount + bolloAmount */
  grossTotal: number;
  /** Ritenuta d'acconto amount */
  ritenutaAmount: number;
  /** Net payable = grossTotal - ritenutaAmount */
  netPayable: number;
}

export interface InvoiceCalcInput {
  /** Line items: array of { quantity, unitPriceCents } */
  items: Array<{ quantity: number; unitPriceCents: number }>;
  /** IVA rate as percentage (e.g. 22 for 22%) */
  ivaRate: number;
  /** Whether to apply ritenuta d'acconto */
  applyRitenuta: boolean;
  /** Ritenuta rate as percentage (e.g. 20 for 20%) */
  ritenutaRate: number;
  /** Whether to apply cassa previdenziale */
  applyCassa: boolean;
  /** Cassa rate as percentage (e.g. 4 for 4%) */
  cassaRate: number;
  /** Whether to apply bollo virtuale (required when IVA-exempt and total > EUR 77.47) */
  applyBollo: boolean;
}

const BOLLO_AMOUNT_CENTS = 200; // EUR 2.00

function roundCents(value: number): number {
  return Math.round(value);
}

export function calculateInvoice(input: InvoiceCalcInput): InvoiceCalculation {
  const subtotal = input.items.reduce(
    (sum, item) => sum + roundCents(item.quantity * item.unitPriceCents),
    0,
  );

  const cassaAmount = input.applyCassa ? roundCents(subtotal * (input.cassaRate / 100)) : 0;

  const taxableBase = subtotal + cassaAmount;

  const ivaAmount = roundCents(taxableBase * (input.ivaRate / 100));

  const bolloAmount = input.applyBollo ? BOLLO_AMOUNT_CENTS : 0;

  const grossTotal = taxableBase + ivaAmount + bolloAmount;

  // Ritenuta is calculated on taxable base (subtotal + cassa)
  const ritenutaAmount = input.applyRitenuta
    ? roundCents(taxableBase * (input.ritenutaRate / 100))
    : 0;

  const netPayable = grossTotal - ritenutaAmount;

  return {
    subtotal,
    cassaAmount,
    taxableBase,
    ivaAmount,
    bolloAmount,
    grossTotal,
    ritenutaAmount,
    netPayable,
  };
}

/**
 * Validates Italian Partita IVA (11 digits, Luhn check)
 */
export function validatePartitaIVA(piva: string): boolean {
  if (!/^\d{11}$/.test(piva)) return false;

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(piva[i], 10);
    if (i % 2 === 0) {
      sum += digit;
    } else {
      const doubled = digit * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    }
  }
  return sum % 10 === 0;
}

/**
 * Validates Italian Codice Fiscale (16 chars alphanumeric or 11 digit for companies)
 */
export function validateCodiceFiscale(cf: string): boolean {
  // Company CF is same as P.IVA (11 digits)
  if (/^\d{11}$/.test(cf)) return validatePartitaIVA(cf);
  // Personal CF: 16 alphanumeric chars
  if (!/^[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z]\d{3}[A-Z]$/i.test(cf)) return false;
  return true;
}

/**
 * Formats an amount in cents to EUR display string
 */
export function formatCurrency(cents: number, locale: 'it' | 'en' = 'it'): string {
  const euros = cents / 100;
  return new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(euros);
}

/**
 * Generates progressive invoice number for the year
 * Format: FT-{number}/{year} e.g. FT-3/2026
 */
export function formatInvoiceNumber(sequenceNumber: number, year: number): string {
  return `FT-${sequenceNumber}/${year}`;
}
