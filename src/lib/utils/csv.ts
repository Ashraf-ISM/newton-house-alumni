/** Minimal RFC 4180 CSV builder with spreadsheet formula-injection protection. */
export function toCsv(headers: string[], rows: (string | number)[][]) {
  const cell = (v: string | number) => {
    let s = String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "\uFEFF" + [headers, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
}
