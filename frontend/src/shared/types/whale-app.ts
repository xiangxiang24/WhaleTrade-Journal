// ฟังก์ชันที่ Electron เปิดให้หน้าจอผ่าน preload (มีเฉพาะในแอปจริง; เปิดผ่านเบราว์เซอร์ตอนพัฒนาจะเป็น undefined)
type WithError = { error: string }

export type BackupInfo = { autoDir: string; lastAuto: string | null }
export type PickedBackup = { path: string; createdAt: string }

export type WhaleApp = {
  /** พิมพ์ HTML เป็น PDF แล้วให้ผู้ใช้เลือกที่บันทึก */
  exportPdf: (html: string, filename: string) => Promise<{ path: string } | { canceled: true } | WithError>
  backup: {
    info: () => Promise<BackupInfo>
    create: () => Promise<{ path: string } | { canceled: true } | WithError>
    pickRestore: () => Promise<PickedBackup | { canceled: true } | WithError>
    restore: () => Promise<{ ok: true } | WithError>
  }
}

declare global {
  interface Window {
    whaleApp?: WhaleApp
  }
}
