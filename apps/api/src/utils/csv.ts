/**
 * Simple CSV generation utility.
 * Escapes fields that contain commas, quotes, or newlines.
 * Prevents CSV injection by prefixing dangerous characters with a single quote.
 */

const CSV_INJECTION_CHARS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Sanitize a cell value to prevent CSV/formula injection.
 * If a value starts with =, +, -, @, tab, or carriage return,
 * it is prefixed with a single quote so spreadsheet applications
 * treat it as a text literal instead of a formula.
 */
function sanitize(val: string): string {
  if (val.length > 0 && CSV_INJECTION_CHARS.includes(val[0])) {
    return `'${val}`;
  }
  return val;
}

export function toCsv(headers: string[], rows: string[][]): string {
  const escape = (val: string) => {
    const safe = sanitize(val);
    if (safe.includes(',') || safe.includes('"') || safe.includes('\n')) {
      return `"${safe.replace(/"/g, '""')}"`;
    }
    return safe;
  };

  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map((v) => escape(v ?? '')).join(',')),
  ];

  return lines.join('\n');
}
