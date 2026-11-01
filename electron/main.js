import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ใน ESM ไม่มี __dirname ต้องสร้างเอง
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'), // preload ต้องเป็น .mjs
      contextIsolation: true,   // แยก renderer ออกจาก Node เพื่อความปลอดภัย
      nodeIntegration: false,
    },
  });
  if (!app.isPackaged) win.loadURL('http://localhost:5173'); // Vite dev server
  else win.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
}

app.whenReady().then(() => {
  // 1. หาตำแหน่งไฟล์ฐานข้อมูล (โฟลเดอร์ข้อมูลของแอปบน Mac)
  const dbPath = path.join(app.getPath('userData'), 'whaletrade-journal.db');
  console.log('DB path:', dbPath);

  // 2. รัน migration  (ยังไม่ทำ จะทำใน Step 9)
  // 3. createDb(dbPath) แล้ว startServer(db)  (ยังไม่ทำ รอให้ server พร้อมก่อน)

  // 4. เปิดหน้าต่าง
  createWindow();
});
// Mac: ปิดหน้าต่างแล้วแอปยังรันอยู่ (จำเป็นสำหรับตัวเตือน)
app.on('window-all-closed', () => { /* ไม่ quit */ });