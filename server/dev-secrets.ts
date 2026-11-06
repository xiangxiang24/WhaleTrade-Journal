import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Secrets } from './context.js';

/** ค่าลับสำหรับตอนพัฒนา: สร้างสุ่มครั้งแรกแล้วเก็บในไฟล์ .dev-secrets.json (อยู่ใน .gitignore) แอปจริงใช้ Keychain แทน */
export function loadDevSecrets(file = path.resolve('.dev-secrets.json')): Secrets {
  if (fs.existsSync(file)) {
    const saved = JSON.parse(fs.readFileSync(file, 'utf8')) as { jwtSecret: string; recoveryKey: string };
    return { jwtSecret: saved.jwtSecret, recoveryKey: Buffer.from(saved.recoveryKey, 'base64') };
  }
  const secrets: Secrets = { jwtSecret: crypto.randomBytes(48).toString('base64'), recoveryKey: crypto.randomBytes(32) };
  fs.writeFileSync(
    file,
    JSON.stringify({ jwtSecret: secrets.jwtSecret, recoveryKey: secrets.recoveryKey.toString('base64') }),
    { mode: 0o600 },
  );
  return secrets;
}
