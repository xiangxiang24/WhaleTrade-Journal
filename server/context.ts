import type { Db } from './db/client.js';

/** ค่าลับของ server (สร้างตอนเปิดแอป ไม่เก็บในไฟล์ .db): ตอนพัฒนาอ่านจาก dev-secrets, แอปจริงเก็บใน Keychain ผ่าน Electron safeStorage */
export type Secrets = {
  /** กุญแจเซ็น JWT */
  jwtSecret: string
  /** กุญแจ AES-256-GCM 32 ไบต์ ใช้เข้ารหัสรหัสกู้คืน */
  recoveryKey: Buffer
}

/** สิ่งที่ทุก route / controller / service ใช้ร่วมกัน */
export type AppContext = {
  db: Db
  secrets: Secrets
}
