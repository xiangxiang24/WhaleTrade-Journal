// สร้างไฟล์ CSV (database.md §7): UTF-8 BOM ให้ภาษาไทยเปิดใน Excel ไม่เพี้ยน, ขึ้นบรรทัดด้วย CRLF

// ค่าที่ขึ้นต้นด้วยอักขระเหล่านี้ Excel จะตีความเป็นสูตร (CSV injection) จึงนำหน้าด้วย '
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  let result = String(value);
  if (typeof value === 'string' && FORMULA_START.test(result)) result = `'${result}`;
  return /[",\r\n]/.test(result) ? `"${result.replace(/"/g, '""')}"` : result;
}

export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  const lines = [header, ...rows].map((row) => row.map(cell).join(','));
  return `﻿${lines.join('\r\n')}\r\n`;
}
