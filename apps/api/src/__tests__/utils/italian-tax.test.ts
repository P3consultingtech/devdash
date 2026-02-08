import { describe, it, expect } from 'vitest';
import {
  calculateInvoice,
  validatePartitaIVA,
  validateCodiceFiscale,
  formatCurrency,
  formatInvoiceNumber,
} from '../../utils/italian-tax';
import type { InvoiceCalcInput } from '../../utils/italian-tax';

describe('Italian Tax Utilities', () => {
  describe('calculateInvoice', () => {
    const baseInput: InvoiceCalcInput = {
      items: [{ quantity: 1, unitPriceCents: 10000 }], // EUR 100.00
      ivaRate: 22,
      applyRitenuta: false,
      ritenutaRate: 20,
      applyCassa: false,
      cassaRate: 4,
      applyBollo: false,
    };

    it('should calculate a simple invoice with IVA only', () => {
      const result = calculateInvoice(baseInput);
      expect(result.subtotal).toBe(10000);
      expect(result.cassaAmount).toBe(0);
      expect(result.taxableBase).toBe(10000);
      expect(result.ivaAmount).toBe(2200); // 22% of 10000
      expect(result.bolloAmount).toBe(0);
      expect(result.grossTotal).toBe(12200);
      expect(result.ritenutaAmount).toBe(0);
      expect(result.netPayable).toBe(12200);
    });

    it('should calculate invoice with cassa previdenziale', () => {
      const input: InvoiceCalcInput = {
        ...baseInput,
        applyCassa: true,
        cassaRate: 4,
      };
      const result = calculateInvoice(input);
      expect(result.subtotal).toBe(10000);
      expect(result.cassaAmount).toBe(400); // 4% of 10000
      expect(result.taxableBase).toBe(10400); // 10000 + 400
      expect(result.ivaAmount).toBe(2288); // 22% of 10400
      expect(result.grossTotal).toBe(12688); // 10400 + 2288
      expect(result.netPayable).toBe(12688);
    });

    it('should calculate invoice with ritenuta d acconto', () => {
      const input: InvoiceCalcInput = {
        ...baseInput,
        applyRitenuta: true,
        ritenutaRate: 20,
      };
      const result = calculateInvoice(input);
      expect(result.subtotal).toBe(10000);
      expect(result.taxableBase).toBe(10000);
      expect(result.ivaAmount).toBe(2200);
      expect(result.grossTotal).toBe(12200);
      expect(result.ritenutaAmount).toBe(2000); // 20% of 10000
      expect(result.netPayable).toBe(10200); // 12200 - 2000
    });

    it('should calculate invoice with bollo virtuale', () => {
      const input: InvoiceCalcInput = {
        ...baseInput,
        applyBollo: true,
      };
      const result = calculateInvoice(input);
      expect(result.bolloAmount).toBe(200); // EUR 2.00
      expect(result.grossTotal).toBe(12400); // 10000 + 2200 + 200
      expect(result.netPayable).toBe(12400);
    });

    it('should calculate invoice with all options enabled', () => {
      const input: InvoiceCalcInput = {
        items: [{ quantity: 1, unitPriceCents: 10000 }],
        ivaRate: 22,
        applyRitenuta: true,
        ritenutaRate: 20,
        applyCassa: true,
        cassaRate: 4,
        applyBollo: true,
      };
      const result = calculateInvoice(input);
      expect(result.subtotal).toBe(10000);
      expect(result.cassaAmount).toBe(400); // 4% of 10000
      expect(result.taxableBase).toBe(10400);
      expect(result.ivaAmount).toBe(2288); // 22% of 10400
      expect(result.bolloAmount).toBe(200);
      expect(result.grossTotal).toBe(12888); // 10400 + 2288 + 200
      expect(result.ritenutaAmount).toBe(2080); // 20% of 10400
      expect(result.netPayable).toBe(10808); // 12888 - 2080
    });

    it('should handle multiple line items', () => {
      const input: InvoiceCalcInput = {
        ...baseInput,
        items: [
          { quantity: 2, unitPriceCents: 5000 }, // 2 x EUR 50 = EUR 100
          { quantity: 3, unitPriceCents: 2000 }, // 3 x EUR 20 = EUR 60
        ],
      };
      const result = calculateInvoice(input);
      expect(result.subtotal).toBe(16000); // 10000 + 6000
      expect(result.ivaAmount).toBe(3520); // 22% of 16000
      expect(result.grossTotal).toBe(19520);
    });

    it('should handle zero quantity items', () => {
      const input: InvoiceCalcInput = {
        ...baseInput,
        items: [{ quantity: 0, unitPriceCents: 10000 }],
      };
      const result = calculateInvoice(input);
      expect(result.subtotal).toBe(0);
      expect(result.ivaAmount).toBe(0);
      expect(result.grossTotal).toBe(0);
    });

    it('should handle empty items array', () => {
      const input: InvoiceCalcInput = {
        ...baseInput,
        items: [],
      };
      const result = calculateInvoice(input);
      expect(result.subtotal).toBe(0);
      expect(result.taxableBase).toBe(0);
      expect(result.ivaAmount).toBe(0);
      expect(result.grossTotal).toBe(0);
      expect(result.netPayable).toBe(0);
    });

    it('should handle IVA rate of 0 (IVA-exempt)', () => {
      const input: InvoiceCalcInput = {
        ...baseInput,
        ivaRate: 0,
      };
      const result = calculateInvoice(input);
      expect(result.ivaAmount).toBe(0);
      expect(result.grossTotal).toBe(10000);
    });

    it('should round fractional amounts correctly', () => {
      const input: InvoiceCalcInput = {
        ...baseInput,
        items: [{ quantity: 1, unitPriceCents: 333 }], // EUR 3.33
        ivaRate: 22,
      };
      const result = calculateInvoice(input);
      expect(result.subtotal).toBe(333);
      // 22% of 333 = 73.26 -> rounds to 73
      expect(result.ivaAmount).toBe(73);
      expect(result.grossTotal).toBe(406);
    });

    it('should handle fractional quantity (e.g., hours)', () => {
      const input: InvoiceCalcInput = {
        ...baseInput,
        items: [{ quantity: 1.5, unitPriceCents: 10000 }], // 1.5 x EUR 100
      };
      const result = calculateInvoice(input);
      expect(result.subtotal).toBe(15000);
    });

    it('should apply bollo as fixed EUR 2.00 regardless of subtotal', () => {
      const smallInput: InvoiceCalcInput = {
        ...baseInput,
        items: [{ quantity: 1, unitPriceCents: 100 }], // EUR 1.00
        applyBollo: true,
      };
      const result = calculateInvoice(smallInput);
      expect(result.bolloAmount).toBe(200);
    });
  });

  describe('validatePartitaIVA', () => {
    it('should return true for a valid Partita IVA', () => {
      // 12345678903 passes the Luhn-like check
      expect(validatePartitaIVA('12345678903')).toBe(true);
    });

    it('should return false for an invalid Partita IVA (wrong checksum)', () => {
      expect(validatePartitaIVA('12345678901')).toBe(false);
    });

    it('should return false for too few digits', () => {
      expect(validatePartitaIVA('1234567890')).toBe(false);
    });

    it('should return false for too many digits', () => {
      expect(validatePartitaIVA('123456789012')).toBe(false);
    });

    it('should return false for non-numeric characters', () => {
      expect(validatePartitaIVA('1234567890a')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validatePartitaIVA('')).toBe(false);
    });

    it('should return false for alphabetic string', () => {
      expect(validatePartitaIVA('abcdefghijk')).toBe(false);
    });

    it('should return true for all-zero PIVA (00000000000)', () => {
      // Luhn check: sum of 0s = 0, 0 % 10 = 0 -> valid
      expect(validatePartitaIVA('00000000000')).toBe(true);
    });
  });

  describe('validateCodiceFiscale', () => {
    it('should return true for a valid personal Codice Fiscale format', () => {
      // Format: 6 letters, 2 digits, 1 month letter, 2 digits, 1 letter, 3 digits, 1 letter
      expect(validateCodiceFiscale('RSSMRA85M01H501Z')).toBe(true);
    });

    it('should return true for a company CF (valid 11-digit Partita IVA)', () => {
      expect(validateCodiceFiscale('00000000000')).toBe(true);
    });

    it('should return false for an invalid personal CF format', () => {
      expect(validateCodiceFiscale('INVALID123456')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validateCodiceFiscale('')).toBe(false);
    });

    it('should return false for random string', () => {
      expect(validateCodiceFiscale('hello world')).toBe(false);
    });

    it('should validate case-insensitively for personal CF', () => {
      expect(validateCodiceFiscale('rssmra85m01h501z')).toBe(true);
    });

    it('should return false for 11 digits with invalid Luhn check', () => {
      expect(validateCodiceFiscale('12345678901')).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    it('should format cents to Italian EUR currency string', () => {
      const result = formatCurrency(12350, 'it');
      // Italian format: EUR followed by amount with comma decimal
      expect(result).toContain('123,50');
    });

    it('should format cents to English EUR currency string', () => {
      const result = formatCurrency(12350, 'en');
      // English format uses dot decimal separator
      expect(result).toContain('123.50');
    });

    it('should default to Italian locale', () => {
      const result = formatCurrency(12350);
      expect(result).toContain('123,50');
    });

    it('should handle zero cents', () => {
      const result = formatCurrency(0, 'en');
      expect(result).toContain('0.00');
    });

    it('should handle large amounts', () => {
      const result = formatCurrency(10000000, 'en'); // EUR 100,000.00
      expect(result).toContain('100,000.00');
    });

    it('should handle single cent', () => {
      const result = formatCurrency(1, 'en');
      expect(result).toContain('0.01');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-5000, 'en');
      expect(result).toContain('50.00');
    });
  });

  describe('formatInvoiceNumber', () => {
    it('should format invoice number with sequence and year', () => {
      expect(formatInvoiceNumber(1, 2026)).toBe('FT-1/2026');
    });

    it('should format multi-digit sequence numbers', () => {
      expect(formatInvoiceNumber(42, 2026)).toBe('FT-42/2026');
    });

    it('should format large sequence numbers', () => {
      expect(formatInvoiceNumber(999, 2025)).toBe('FT-999/2025');
    });

    it('should handle different years', () => {
      expect(formatInvoiceNumber(1, 2024)).toBe('FT-1/2024');
      expect(formatInvoiceNumber(1, 2030)).toBe('FT-1/2030');
    });

    it('should handle sequence number 0', () => {
      expect(formatInvoiceNumber(0, 2026)).toBe('FT-0/2026');
    });
  });
});
