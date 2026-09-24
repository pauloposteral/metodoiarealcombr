export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  // Spreadsheet software may execute formulas even inside quoted CSV fields.
  if (typeof value !== 'number' && (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text))) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export const exportToCSV = (data: Record<string, unknown>[], filename: string, columns?: { key: string; label: string }[]) => {
  if (data.length === 0) return;
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));
  const csv = [cols.map(c => csvCell(c.label)).join(','), ...data.map(row => cols.map(c => csvCell(row[c.key])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
