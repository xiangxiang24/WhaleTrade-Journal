import { app, BrowserWindow, dialog, shell } from 'electron';
import type { Server } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDb } from '../server/db/client.js';
import { runMigrations } from '../server/db/migrate.js';
import { startServer } from '../server/index.js';
import { importAssets } from '../server/services/assets/assets.js';
import { loadSecrets } from './secrets.js';

// ใน ESM ไม่มี __dirname ต้องสร้างเอง (ไฟล์นี้ถูก compile ไปอยู่ที่ dist/electron/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// พอร์ตคงที่ เพราะ token ที่จำไว้ในหน้าจอผูกกับ origin (เปลี่ยนพอร์ต = ต้องล็อกอินใหม่)
// ตอนพัฒนา (npm run start:app) ใช้ 3001 ให้ Vite proxy มาหาได้เหมือน npm run dev
const PORT = app.isPackaged ? 47821 : 3001;
let server: Server | undefined;

// เปิดแอปได้ทีละหน้าต่างเดียว (ไม่งั้นสองตัวจะแย่งพอร์ตและเขียนฐานข้อมูลเดียวกัน)
if (!app.requestSingleInstanceLock()) app.quit();

/** เตรียมฐานข้อมูลใน userData → รัน migration → นำเข้ารายการหุ้น → เปิด API (packaged: ส่งหน้าเว็บให้ด้วย) */
async function startBackend() {
  const userData = app.getPath('userData');
  // ติดตั้งแล้ว migration/seed อยู่ใน resources; ตอนพัฒนาอยู่ในโฟลเดอร์โปรเจกต์
  const root = app.isPackaged ? process.resourcesPath : app.getAppPath();
  const migrationsDir = app.isPackaged ? path.join(root, 'migrations') : path.join(root, 'prisma/migrations');
  const dbPath = path.join(userData, 'whaletrade-journal.db');

  runMigrations(dbPath, migrationsDir);
  const db = createDb(dbPath);
  await importAssets(db, path.join(root, 'seed/assets.json'));

  const webDir = app.isPackaged ? path.join(app.getAppPath(), 'frontend/dist') : undefined;
  server = startServer({ db, secrets: await loadSecrets(userData), dataDir: path.join(userData, 'files') }, PORT, webDir);
  await new Promise<void>((resolve, reject) => {
    server!.once('listening', resolve);
    server!.once('error', reject);
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
app.on('before-quit', () => server?.close());
