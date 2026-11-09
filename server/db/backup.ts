import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

/** ชื่อไฟล์ใน 1 โฟลเดอร์สำรอง: ฐานข้อมูล + โฟลเดอร์ไฟล์ผู้ใช้ + ค่าลับ + รายละเอียด */
const DB_FILE = 'whaletrade-journal.db';
const FILES_DIR = 'files';
const SECRETS_FILE = 'secrets.bin';
const MANIFEST_FILE = 'backup.json';

export type BackupManifest = { app: 'whaletrade-journal'; createdAt: string };

/** ตำแหน่งข้อมูลจริงของแอป (userData) */
export type AppData = { dbPath: string; filesDir: string; secretsPath: string };

const pad = (n: number) => String(n).padStart(2, '0');
export const stamp = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

/** สำเนาข้อมูลทั้งหมดลงโฟลเดอร์ใหม่ (ฐานข้อมูลสำรองด้วย SQLite backup API จึงสำเนาได้แม้แอปกำลังเขียนอยู่) */
export async function createBackup(data: AppData, destDir: string): Promise<string> {
  fs.mkdirSync(destDir, { recursive: true });
  const sqlite = new Database(data.dbPath, { readonly: true });
  try {
    await sqlite.backup(path.join(destDir, DB_FILE));
  } finally {
    sqlite.close();
  }
  if (fs.existsSync(data.filesDir)) fs.cpSync(data.filesDir, path.join(destDir, FILES_DIR), { recursive: true });
  if (fs.existsSync(data.secretsPath)) fs.copyFileSync(data.secretsPath, path.join(destDir, SECRETS_FILE));
  const manifest: BackupManifest = { app: 'whaletrade-journal', createdAt: new Date().toISOString() };
  fs.writeFileSync(path.join(destDir, MANIFEST_FILE), JSON.stringify(manifest, null, 2));
  return destDir;
}

/** ตรวจว่าโฟลเดอร์นี้เป็นโฟลเดอร์สำรองของแอปจริง (มีรายละเอียด + ฐานข้อมูลที่เปิดอ่านได้) คืนรายละเอียด ไม่ผ่านให้ throw */
export function readBackup(dir: string): BackupManifest {
  let manifest: BackupManifest;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(dir, MANIFEST_FILE), 'utf8')) as BackupManifest;
  } catch {
    throw new Error('This folder is not a Whale Trade Journal backup.');
  }
  if (manifest.app !== 'whaletrade-journal' || !fs.existsSync(path.join(dir, DB_FILE))) {
    throw new Error('This folder is not a Whale Trade Journal backup.');
  }
  const sqlite = new Database(path.join(dir, DB_FILE), { readonly: true });
  try {
    sqlite.prepare('SELECT 1 FROM User LIMIT 1').get();
  } catch {
    throw new Error('This backup is damaged and cannot be restored.');
  } finally {
    sqlite.close();
  }
  return manifest;
}

/** ใส่ข้อมูลจากโฟลเดอร์สำรองกลับเข้าแอป (ต้องปิดการเชื่อมต่อฐานข้อมูลก่อนเรียก) ไฟล์ -wal/-shm เดิมต้องลบ ไม่งั้น SQLite จะเอาไปปนกับฐานข้อมูลใหม่ */
export function restoreBackup(data: AppData, srcDir: string): void {
  readBackup(srcDir);
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(data.dbPath + suffix, { force: true });
  fs.copyFileSync(path.join(srcDir, DB_FILE), data.dbPath);
  fs.rmSync(data.filesDir, { recursive: true, force: true });
  if (fs.existsSync(path.join(srcDir, FILES_DIR))) fs.cpSync(path.join(srcDir, FILES_DIR), data.filesDir, { recursive: true });
  if (fs.existsSync(path.join(srcDir, SECRETS_FILE))) fs.copyFileSync(path.join(srcDir, SECRETS_FILE), data.secretsPath);
}

/** สำรองอัตโนมัติวันละครั้ง (ชื่อ auto-YYYY-MM-DD) เก็บไว้ล่าสุด keep ชุด คืนโฟลเดอร์ที่สร้างใหม่ หรือ null ถ้าวันนี้มีแล้ว */
export async function autoBackup(data: AppData, backupsDir: string, now = new Date(), keep = 7): Promise<string | null> {
  const name = `auto-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const dest = path.join(backupsDir, name);
  if (fs.existsSync(dest)) return null;
  // สร้างในโฟลเดอร์ชั่วคราวก่อนแล้วค่อยเปลี่ยนชื่อ กันค้างครึ่งๆ กลางๆ แล้วถูกนับว่าวันนี้สำรองแล้ว
  const tmp = `${dest}.partial`;
  fs.rmSync(tmp, { recursive: true, force: true });
  await createBackup(data, tmp);
  fs.renameSync(tmp, dest);
  const old = fs
    .readdirSync(backupsDir)
    .filter((entry) => /^auto-\d{4}-\d{2}-\d{2}$/.test(entry))
    .sort()
    .slice(0, -keep);
  for (const entry of old) fs.rmSync(path.join(backupsDir, entry), { recursive: true, force: true });
  return dest;
}
