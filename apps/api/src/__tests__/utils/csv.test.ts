import { describe, it, expect } from 'vitest';
import { toCsv } from '../../utils/csv';

describe('CSV Utility - toCsv', () => {
  describe('normal data export', () => {
    it('should produce CSV with headers and rows', () => {
      const headers = ['Name', 'Email', 'Age'];
      const rows = [
        ['Alice', 'alice@example.com', '30'],
        ['Bob', 'bob@example.com', '25'],
      ];
      const result = toCsv(headers, rows);
      const lines = result.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('Name,Email,Age');
      expect(lines[1]).toBe('Alice,alice@example.com,30');
      expect(lines[2]).toBe('Bob,bob@example.com,25');
    });

    it('should produce only the header line when there are no rows', () => {
      const result = toCsv(['Col1', 'Col2'], []);
      expect(result).toBe('Col1,Col2');
    });

    it('should handle a single column', () => {
      const result = toCsv(['Name'], [['Alice'], ['Bob']]);
      expect(result).toBe('Name\nAlice\nBob');
    });

    it('should handle a single row', () => {
      const result = toCsv(['A', 'B'], [['1', '2']]);
      expect(result).toBe('A,B\n1,2');
    });
  });

  describe('empty data', () => {
    it('should handle empty headers and empty rows', () => {
      const result = toCsv([], []);
      // Just an empty line for headers, no rows
      expect(result).toBe('');
    });

    it('should handle rows with empty string values', () => {
      const result = toCsv(['A', 'B'], [['', '']]);
      expect(result).toBe('A,B\n,');
    });
  });

  describe('special characters handling', () => {
    it('should escape fields containing commas', () => {
      const result = toCsv(['Name', 'Address'], [['Alice', '123 Main St, Suite 4']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe('Alice,"123 Main St, Suite 4"');
    });

    it('should escape fields containing double quotes by doubling them', () => {
      const result = toCsv(['Name', 'Quote'], [['Alice', 'She said "hello"']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe('Alice,"She said ""hello"""');
    });

    it('should escape fields containing newlines', () => {
      const result = toCsv(['Name', 'Bio'], [['Alice', 'Line one\nLine two']]);
      // The field with newline should be wrapped in quotes
      expect(result).toContain('"Line one\nLine two"');
    });

    it('should escape fields that contain commas and quotes together', () => {
      const result = toCsv(['Data'], [['value, with "quotes"']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe('"value, with ""quotes"""');
    });

    it('should escape header fields that contain commas', () => {
      const result = toCsv(['Name, First', 'Age'], [['Alice', '30']]);
      const lines = result.split('\n');
      expect(lines[0]).toBe('"Name, First",Age');
    });

    it('should not escape fields without special characters', () => {
      const result = toCsv(['Name'], [['SimpleValue']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe('SimpleValue');
    });
  });

  describe('CSV injection prevention', () => {
    it('should prefix fields starting with = with a single quote', () => {
      const result = toCsv(['Data'], [['=SUM(A1:A10)']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe("'=SUM(A1:A10)");
    });

    it('should prefix fields starting with + with a single quote', () => {
      const result = toCsv(['Data'], [['+cmd|something']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe("'+cmd|something");
    });

    it('should prefix fields starting with - with a single quote', () => {
      const result = toCsv(['Data'], [['-value']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe("'-value");
    });

    it('should prefix fields starting with @ with a single quote', () => {
      const result = toCsv(['Data'], [['@SUM(A1)']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe("'@SUM(A1)");
    });

    it('should prefix fields starting with tab with a single quote', () => {
      const result = toCsv(['Data'], [['\tmalicious']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe("'\tmalicious");
    });

    it('should prefix fields starting with carriage return with a single quote', () => {
      const result = toCsv(['Data'], [['\rmalicious']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe("'\rmalicious");
    });

    it('should not prefix safe values that do not start with injection characters', () => {
      const result = toCsv(['Data'], [['safe value']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe('safe value');
    });

    it('should not prefix numeric values', () => {
      const result = toCsv(['Data'], [['12345']]);
      const lines = result.split('\n');
      expect(lines[1]).toBe('12345');
    });

    it('should sanitize header fields as well', () => {
      const result = toCsv(['=Formula'], [['data']]);
      const lines = result.split('\n');
      expect(lines[0]).toBe("'=Formula");
    });

    it('should both sanitize and quote-escape when value has injection char and comma', () => {
      const result = toCsv(['Data'], [['=formula, with comma']]);
      const lines = result.split('\n');
      // First sanitized to '=formula, with comma, then quoted due to comma
      expect(lines[1]).toBe('"\'=formula, with comma"');
    });
  });

  describe('null/undefined value handling', () => {
    it('should convert null-ish values to empty strings via the ?? operator', () => {
      // The source code uses (v ?? '') which handles null and undefined
      const rows: any[][] = [[null, undefined, 'valid']];
      const result = toCsv(['A', 'B', 'C'], rows);
      const lines = result.split('\n');
      expect(lines[1]).toBe(',,valid');
    });
  });

  describe('large data', () => {
    it('should handle many rows', () => {
      const headers = ['Index', 'Value'];
      const rows = Array.from({ length: 1000 }, (_, i) => [String(i), `val-${i}`]);
      const result = toCsv(headers, rows);
      const lines = result.split('\n');
      expect(lines).toHaveLength(1001); // 1 header + 1000 rows
      expect(lines[0]).toBe('Index,Value');
      expect(lines[1]).toBe('0,val-0');
      expect(lines[1000]).toBe('999,val-999');
    });

    it('should handle many columns', () => {
      const headers = Array.from({ length: 50 }, (_, i) => `Col${i}`);
      const row = Array.from({ length: 50 }, (_, i) => `val${i}`);
      const result = toCsv(headers, [row]);
      const lines = result.split('\n');
      expect(lines).toHaveLength(2);
      expect(lines[0].split(',')).toHaveLength(50);
      expect(lines[1].split(',')).toHaveLength(50);
    });
  });
});
