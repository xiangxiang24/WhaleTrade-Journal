// ช่อง IPC ระหว่างหน้าจอกับ main process (เปิดเฉพาะคำสั่งที่อนุญาต)
// ESM ของ Electron ไม่ export ชื่อออกมาตรงๆ ต้อง import ตัวรวมแล้วดึงออกมา
import electron from 'electron';

const { contextBridge, ipcRenderer } = electron;

contextBridge.exposeInMainWorld('whaleApp', {
  exportPdf: (html: string, filename: string) => ipcRenderer.invoke('export:pdf', html, filename),
  backup: {
    info: () => ipcRenderer.invoke('backup:info'),
    create: () => ipcRenderer.invoke('backup:create'),
    pickRestore: () => ipcRenderer.invoke('backup:pick-restore'),
    restore: () => ipcRenderer.invoke('backup:restore'),
  },
});
