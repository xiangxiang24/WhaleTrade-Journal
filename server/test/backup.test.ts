import Database from 'better-sqlite3';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { autoBackup, createBackup, readBackup, restoreBackup, type AppData } from '../db/backup.js';
import { runMigrations } from '../db/migrate.js';

function makeApp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'whale-backup-'));
  const data: AppData = { dbPath: path.join(dir, 'app.db'), filesDir: path.join(dir, 'files'), secretsPath: path.join(dir, 'secrets.bin') };
  runMigrations(data.dbPath, path.resolve('prisma/migrations'));
  fs.mkdirSync(path.join(data.filesDir, '1'), { recursive: true });
  fs.writeFileSync(path.join(data.filesDir, '1', 'a.txt'), 'attachment');
  fs.writeFileSync(data.secretsPath, 'secret');
  return { dir, data };
}

const countUsers = (dbPath: string) => {
  const sqlite = new Database(dbPath, { readonly: true });
  try {
    return (sqlite.prepare('SELECT COUNT(*) AS n FROM User').get() as { n: number }).n;
  } finally {
    sqlite.close();
  }
};

function addUser(dbPath: string, email: string) {
  const sqlite = new Database(dbPath);
  sqlite.prepare("INSERT INTO User (email, fullName, displayName, passwordHash, recoveryCode) VALUES (?, 'A', 'A', 'x', 'x')").run(email);
  sqlite.close();
}

describe('backup and restore', () => {
  it('backs up, rejects non-backup folders, and restores data and files', async () => {
    const { dir, data } = makeApp();
    addUser(data.dbPath, 'a@example.com');
    const dest = path.join(dir, 'out');
    await createBackup(data, dest);
    assert.equal(readBackup(dest).app, 'whaletrade-journal');
    assert.throws(() => readBackup(dir), /not a Whale Trade Journal backup/);

    addUser(data.dbPath, 'b@example.com');
    fs.writeFileSync(path.join(data.filesDir, '1', 'b.txt'), 'later');
    assert.equal(countUsers(data.dbPath), 2);

    restoreBackup(data, dest);
    assert.equal(countUsers(data.dbPath), 1);
    assert.equal(fs.readFileSync(path.join(data.filesDir, '1', 'a.txt'), 'utf8'), 'attachment');
    assert.equal(fs.existsSync(path.join(data.filesDir, '1', 'b.txt')), false);
    assert.equal(fs.readFileSync(data.secretsPath, 'utf8'), 'secret');
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('auto backup runs once a day and keeps only the newest sets', async () => {
    const { dir, data } = makeApp();
    const backups = path.join(dir, 'backups');
    for (let day = 1; day <= 9; day++) assert.ok(await autoBackup(data, backups, new Date(2026, 10, day)));
    assert.equal(await autoBackup(data, backups, new Date(2026, 10, 9)), null);
    const kept = fs.readdirSync(backups).sort();
    assert.equal(kept.length, 7);
    assert.equal(kept[0], 'auto-2026-11-03');
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
