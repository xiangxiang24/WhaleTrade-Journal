import type { Request } from 'express';
import { HttpError } from '../../middleware/http-error.js';

// ตัวช่วยอ่าน/ตรวจค่าจาก request (ค่าที่ไม่ถูกต้องตอบ 400 พร้อมข้อความอังกฤษให้ frontend แปล)

/** อ่านข้อความ (ไม่ใช่ string = ว่าง) ตัดช่องว่างหัวท้าย */
export const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

/** ข้อความที่ว่างได้: ว่าง = null และตรวจความยาวสูงสุด */
export function optionalText(value: unknown, max: number, message: string): string | null {
  const result = text(value);
  if (result.length > max) throw new HttpError(400, message);
  return result || null;
}

/** ข้อความที่ต้องมี */
export function requiredText(value: unknown, max: number, emptyMessage: string, longMessage: string): string {
  const result = text(value);
  if (!result) throw new HttpError(400, emptyMessage);
  if (result.length > max) throw new HttpError(400, longMessage);
  return result;
}

/** id จาก :id ใน path (ไม่ใช่จำนวนเต็มบวก = 404) */
export function idParam(req: Request, name = 'id'): number {
  const raw = req.params[name];
  const value = typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isSafeInteger(value) || value < 1) throw new HttpError(404, 'This item no longer exists.');
  return value;
}

/** ตัวเลขจำกัดช่วง (ไม่ใช่ตัวเลขจำกัด = 400) */
export function numberIn(value: unknown, min: number, max: number, message: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new HttpError(400, message);
  }
  return value;
}

/** ตัวเลขที่ว่างได้ (null/undefined = null) */
export function optionalNumber(value: unknown, min: number, max: number, message: string): number | null {
  return value === null || value === undefined ? null : numberIn(value, min, max, message);
}

/** เนื้อ JSON ต้องเป็น object */
export function bodyObject(req: Request): Record<string, unknown> {
  const body: unknown = req.body;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(400, 'The request could not be read.');
  }
  return body as Record<string, unknown>;
}
