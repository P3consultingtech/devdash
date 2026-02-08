/**
 * Simple CSV generation utility.
 * Escapes fields that contain commas, quotes, or newlines.
 */
export function toCsv(headers: string[], rows: string[][]): string {
  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map((v) => escape(v ?? '')).join(',')),
  ];

  return lines.join('\n');
}
