import { app, BrowserWindow, dialog, ipcMain, Notification, shell } from 'electron';
import fs from 'node:fs';
import type { Server } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { autoBackup, createBackup, readBackup, restoreBackup, stamp, type AppData } from '../server/db/backup.js';
import { createDb, type Db } from '../server/db/client.js';
import { runMigrations } from '../server/db/migrate.js';
import { startServer } from '../server/index.js';
import { startReminderNotifier } from '../server/services/reminder/notifier.js';
import { importAssets } from '../server/services/assets/assets.js';
import { loadSecrets } from './secrets.js';

// ใน ESM ไม่มี __dirname ต้องสร้างเอง (ไฟล์นี้ถูก compile ไปอยู่ที่ dist/electron/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// พอร์ตคงที่ เพราะ token ที่จำไว้ในหน้าจอผูกกับ origin (เปลี่ยนพอร์ต = ต้องล็อกอินใหม่)
// ตอนพัฒนา (npm run start:app) ใช้ 3001 ให้ Vite proxy มาหาได้เหมือน npm run dev
const PORT = app.isPackaged ? 47821 : 3001;
let server: Server | undefined;
let db: Db | undefined;
let stopNotifier: (() => void) | undefined;
let pendingRestore: string | undefined; // โฟลเดอร์สำรองที่ผู้ใช้เลือกไว้ รอยืนยันกู้คืน (renderer ส่งพาธมาเองไม่ได้)

const dataOf = (): AppData => {
  const userData = app.getPath('userData');
  return { dbPath: path.join(userData, 'whaletrade-journal.db'), filesDir: path.join(userData, 'files'), secretsPath: path.join(userData, 'secrets.bin') };
};
const backupsDir = () => path.join(app.getPath('userData'), 'backups');

/** พิมพ์ HTML ที่หน้าจอส่งมาเป็น PDF: เรนเดอร์ในหน้าต่างซ่อนที่ปิดสคริปต์ทั้งหมด (HTML มาจากข้อมูลผู้ใช้ จึงห้ามรันโค้ด) แล้วให้ผู้ใช้เลือกที่บันทึก */
function registerExportIpc() {
  ipcMain.handle('export:pdf', async (_event, html: unknown, filename: unknown) => {
    let hidden: BrowserWindow | undefined;
    try {
      if (typeof html !== 'string' || typeof filename !== 'string') throw new Error('Invalid export request.');
      const picked = await dialog.showSaveDialog({
        title: 'Save PDF',
        defaultPath: path.join(app.getPath('downloads'), path.basename(filename)),
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });
      if (picked.canceled || !picked.filePath) return { canceled: true };
      hidden = new BrowserWindow({ show: false, webPreferences: { javascript: false, sandbox: true, contextIsolation: true, nodeIntegration: false } });
      await hidden.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      const pdf = await hidden.webContents.printToPDF({ pageSize: 'A4', printBackground: true });
      fs.writeFileSync(picked.filePath, pdf);
      return { path: picked.filePath };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    } finally {
      hidden?.destroy();
    }
  });
}

/** คำสั่งสำรอง/กู้คืนข้อมูลที่หน้า Setting เรียกผ่าน preload; ความผิดพลาดคืนเป็น { error } ให้หน้าจอแสดงเอง */
function registerBackupIpc() {
  const fail = (error: unknown) => ({ error: error instanceof Error ? error.message : String(error) });

  ipcMain.handle('backup:info', () => {
    const dir = backupsDir();
    const autos = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => /^auto-\d{4}-\d{2}-\d{2}$/.test(name)).sort() : [];
    return { autoDir: dir, lastAuto: autos.at(-1)?.slice('auto-'.length) ?? null };
  });

  ipcMain.handle('backup:create', async () => {
    try {
      const picked = await dialog.showOpenDialog({ title: 'Choose where to save the backup', properties: ['openDirectory', 'createDirectory'], buttonLabel: 'Back up here' });
      if (picked.canceled || !picked.filePaths[0]) return { canceled: true };
      const dest = path.join(picked.filePaths[0], `Whale Trade Journal Backup ${stamp(new Date())}`);
      await createBackup(dataOf(), dest);
      return { path: dest };
    } catch (error) {
      return fail(error);
    }
  });

  ipcMain.handle('backup:pick-restore', async () => {
    try {
      const picked = await dialog.showOpenDialog({ title: 'Choose a backup folder to restore', properties: ['openDirectory'], buttonLabel: 'Choose backup' });
      if (picked.canceled || !picked.filePaths[0]) return { canceled: true };
      const manifest = readBackup(picked.filePaths[0]);
      pendingRestore = picked.filePaths[0];
      return { path: pendingRestore, createdAt: manifest.createdAt };
    } catch (error) {
      pendingRestore = undefined;
      return fail(error);
    }
  });

  ipcMain.handle('backup:restore', async () => {
    try {
      if (!pendingRestore) throw new Error('Choose a backup folder first.');
      const src = pendingRestore;
      const data = dataOf();
      // เก็บสำเนาข้อมูลปัจจุบันไว้ก่อนเสมอ เผื่อกู้ผิดชุด
      await createBackup(data, path.join(backupsDir(), `before-restore-${stamp(new Date())}`));
      stopNotifier?.();
      server?.close();
      await db?.$disconnect();
      restoreBackup(data, src);
      app.relaunch();
      app.exit(0);
      return { ok: true };
    } catch (error) {
      return fail(error);
    }
  });
}

// เปิดแอปได้ทีละหน้าต่างเดียว (ไม่งั้นสองตัวจะแย่งพอร์ตและเขียนฐานข้อมูลเดียวกัน)
if (!app.requestSingleInstanceLock()) app.quit();

/** เตรียมฐานข้อมูลใน userData → รัน migration → นำเข้ารายการหุ้น → เปิด API (packaged: ส่งหน้าเว็บให้ด้วย) */
async function startBackend() {
  const userData = app.getPath('userData');
  // ติดตั้งแล้ว migration/seed อยู่ใน resources; ตอนพัฒนาอยู่ในโฟลเดอร์โปรเจกต์
  const root = app.isPackaged ? process.resourcesPath : app.getAppPath();
  const migrationsDir = app.isPackaged ? path.join(root, 'migrations') : path.join(root, 'prisma/migrations');
  const dbPath = path.join(userData, 'whaletrade-journal.db');

  // สำรองอัตโนมัติวันละครั้ง ทำก่อน migration เพื่อให้มีสำเนาของเวอร์ชันเดิมก่อนโครงสร้างเปลี่ยน (พลาดก็ไม่ให้แอปเปิดไม่ได้)
  if (fs.existsSync(dbPath)) {
    try {
      await autoBackup(dataOf(), backupsDir());
    } catch (error) {
      console.error('Automatic backup failed:', error);
    }
  }
  runMigrations(dbPath, migrationsDir);
  db = createDb(dbPath);
  await importAssets(db, path.join(root, 'seed/assets.json'));

  const webDir = app.isPackaged ? path.join(app.getAppPath(), 'frontend/dist') : undefined;
  server = startServer({ db, secrets: await loadSecrets(userData), dataDir: path.join(userData, 'files') }, PORT, webDir);
  await new Promise<void>((resolve, reject) => {
    server!.once('listening', resolve);
    server!.once('error', reject);
  });

  // การเตือนที่ถึงเวลา → macOS notification (แอปรันค้างอยู่หลังปิดหน้าต่าง จึงเตือนได้ต่อเนื่อง); กดแล้วเปิดแอปขึ้นมา
  stopNotifier = startReminderNotifier(db, ({ title, body }) => {
    if (!Notification.isSupported()) return;
    const notification = new Notification({ title, body });
    notification.on('click', () => {
      const [win] = BrowserWindow.getAllWindows();
      if (win) {
        if (win.isMinimized()) win.restore();
        win.show();
        win.focus();
      } else createWindow();
    });
    notification.show();
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // preload เป็น ESM (package เป็น type: module) จึงต้องปิด sandbox
      sandbox: false,
      contextIsolation: true,   // แยก renderer ออกจาก Node เพื่อความปลอดภัย
      nodeIntegration: false,
    },
  });
  // ลิงก์ภายนอกเปิดในเบราว์เซอร์ของระบบ ไม่เปิดในหน้าต่างแอป
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(https?|mailto):/.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  void win.loadURL(app.isPackaged ? `http://127.0.0.1:${PORT}` : 'http://localhost:5173'); // dev: Vite dev server
}

void app.whenReady().then(async () => {
  registerBackupIpc();
  registerExportIpc();
  try {
    await startBackend();
  } catch (error) {
    dialog.showErrorBox('Whale Trade Journal', `The app could not start.\n\n${error instanceof Error ? error.message : String(error)}`);
    app.quit();
    return;
  }
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('second-instance', () => {
  const [win] = BrowserWindow.getAllWindows();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

// Mac: ปิดหน้าต่างแล้วแอปยังรันอยู่ (จำเป็นสำหรับตัวเตือน) server จึงเปิดต่อ
app.on('window-all-closed', () => { /* ไม่ quit */ });
app.on('before-quit', () => {
  stopNotifier?.();
  server?.close();
});
