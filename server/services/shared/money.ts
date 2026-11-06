// แปลงตัวเลขที่ frontend ใช้ (บาท, ราคาต่อหน่วยทศนิยม, จำนวนหน่วยทศนิยม) ↔ จำนวนเต็มที่เก็บใน DB (database.md กฎข้อ 3)
// เงิน = สตางค์, ราคาต่อหน่วย ×10,000, จำนวนหน่วย ×1,000,000

export const toSatang = (baht: number) => BigInt(Math.round(baht * 100));
export const fromSatang = (satang: bigint) => Number(satang) / 100;

export const toPrice = (price: number) => BigInt(Math.round(price * 10_000));
export const fromPrice = (stored: bigint) => Number(stored) / 10_000;

export const toUnits = (units: number) => BigInt(Math.round(units * 1_000_000));
export const fromUnits = (stored: bigint) => Number(stored) / 1_000_000;

/** แปลงค่าที่ว่างได้ */
export const optional = <T, R>(value: T | null, convert: (value: T) => R): R | null =>
  value === null ? null : convert(value);
