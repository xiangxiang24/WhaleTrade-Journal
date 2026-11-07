import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

/**
 * รัน migration (ไฟล์ .sql ใน prisma/migrations) กับฐานข้อมูลของแอปตอนเปิดแอป โดยไม่พึ่ง Prisma CLI (แอปที่ติดตั้งแล้วไม่มี CLI)
 * จำว่าไฟล์ไหนรันแล้วในตาราง _app_migrations เรียงตามชื่อโฟลเดอร์ (ขึ้นต้นด้วยเวลา) คืนรายชื่อที่เพิ่งรัน
 */
export function runMigrations(dbPath: string, migrationsDir: string): string[] {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  try {
    sqlite.pragma('journal_mode = WAL');
    sqlite.exec('CREATE TABLE IF NOT EXISTS _app_migrations (name TEXT PRIMARY KEY, appliedAt TEXT NOT NULL)');
    const done = new Set((sqlite.prepare('SELECT name FROM _app_migrations').all() as { name: string }[]).map((row) => row.name));
    const pending = fs
      .readdirSync(migrationsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !done.has(entry.name))
      .map((entry) => entry.name)
      .sort();
    for (const name of pending) {
      const sql = fs.readFileSync(path.join(migrationsDir, name, 'migration.sql'), 'utf8');
      sqlite.transaction(() => {
        sqlite.exec(sql);
        sqlite.prepare('INSERT INTO _app_migrations (name, appliedAt) VALUES (?, ?)').run(name, new Date().toISOString());
      })();
    }
    return pending;
  } finally {
    sqlite.close();
  }
}
