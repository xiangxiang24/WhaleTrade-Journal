import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// เก็บไฟล์ของผู้ใช้ (ไฟล์แนบ รูปโปรไฟล์) ในโฟลเดอร์ข้อมูลของแอป ไม่เก็บในไฟล์ .db (path ใน DB เป็นที่อยู่สัมพัทธ์)

/** ที่อยู่เต็มของไฟล์ ต้องอยู่ใต้ dataDir เท่านั้น (กัน path traversal) */
function resolveInside(dataDir: string, relative: string): string {
  const root = path.resolve(dataDir);
  const full = path.resolve(root, relative);
  if (!full.startsWith(root + path.sep)) throw new Error('Invalid storage path');
  return full;
}

/** นามสกุลที่ปลอดภัย (ตัวอักษร/ตัวเลข ไม่เกิน 10 ตัว) */
function safeExtension(name: string): string {
  const ext = path.extname(name).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(ext) ? ext : '';
}

/** บันทึกไฟล์ใหม่ใต้ folder ด้วยชื่อสุ่ม คืนที่อยู่สัมพัทธ์ */
export function saveFile(dataDir: string, folder: string, originalName: string, data: Buffer): string {
  const relative = path.posix.join(folder, `${crypto.randomUUID()}${safeExtension(originalName)}`);
  const full = resolveInside(dataDir, relative);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, data, { mode: 0o600 });
  return relative;
}

export const fileExists = (dataDir: string, relative: string) => fs.existsSync(resolveInside(dataDir, relative));

export const filePath = (dataDir: string, relative: string) => resolveInside(dataDir, relative);

/** ลบไฟล์ (ไม่พบ = ข้าม) */
export function removeFile(dataDir: string, relative: string | null | undefined) {
  if (!relative) return;
  fs.rmSync(resolveInside(dataDir, relative), { force: true });
}

/** ลบทั้งโฟลเดอร์ของผู้ใช้ (ตอนลบบัญชี) */
export function removeFolder(dataDir: string, folder: string) {
  fs.rmSync(resolveInside(dataDir, folder), { recursive: true, force: true });
}
