import bcrypt from 'bcrypt';
import type { AppContext } from '../../context.js';
import { HttpError } from '../../middleware/http-error.js';
import { hashPassword, normalizeEmail, signToken, toAccount, type AccountDto } from '../shared/auth.js';
import { decryptRecoveryCode } from '../shared/recovery-code.js';
import { fileExists, filePath, removeFile, removeFolder, saveFile } from '../shared/storage.js';

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_DATA_URL = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/;
const AVATAR_EXTENSION = { png: '.png', jpeg: '.jpg', webp: '.webp' } as const;
const WRONG_PASSWORD = 'Current password is incorrect.';
const SESSION_GONE = 'Your session has expired. Please log in again.';

// บัญชีและการตั้งค่า: โปรไฟล์ ภาษา/เขตเวลา อีเมล รหัสผ่าน รหัสกู้คืน และลบบัญชี (ทุกคำสั่งทำกับผู้ใช้ที่ล็อกอินเท่านั้น)
export function settingPageService({ db, secrets, dataDir }: AppContext) {
  async function load(userId: number) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(401, SESSION_GONE);
    return user;
  }

  /** ยืนยันด้วยรหัสผ่านปัจจุบันก่อนทำเรื่องสำคัญ */
  async function loadWithPassword(userId: number, password: string) {
    const user = await load(userId);
    if (!(await bcrypt.compare(password, user.passwordHash))) throw new HttpError(403, WRONG_PASSWORD);
    return user;
  }

  return {
    async get(userId: number): Promise<AccountDto> {
      return toAccount(secrets, await load(userId));
    },

    /** Save changes: ชื่อที่แสดง + รูปโปรไฟล์ (avatarUrl: null = ลบรูป, data URL = รูปใหม่, URL เดิมของ server = ไม่เปลี่ยน) */
    async updateProfile(userId: number, displayName: string, avatar: string | null): Promise<AccountDto> {
      const user = await load(userId);
      let avatarPath = user.avatar;

      if (avatar === null) {
        removeFile(dataDir, user.avatar);
        avatarPath = null;
      } else if (avatar.startsWith('data:')) {
        const match = AVATAR_DATA_URL.exec(avatar);
        if (!match) throw new HttpError(400, 'Please choose a PNG, JPG or WebP image.');
        const data = Buffer.from(match[2], 'base64');
        if (data.length === 0 || data.length > AVATAR_MAX_BYTES) throw new HttpError(413, 'This image is too large. The limit is 2 MB.');
        avatarPath = saveFile(dataDir, `avatars/${userId}`, `avatar${AVATAR_EXTENSION[match[1] as keyof typeof AVATAR_EXTENSION]}`, data);
        removeFile(dataDir, user.avatar);
      } else if (!avatar.startsWith('/api/avatar/')) {
        throw new HttpError(400, 'Please choose a PNG, JPG or WebP image.');
      }

      return toAccount(secrets, await db.user.update({ where: { id: userId }, data: { displayName, avatar: avatarPath } }));
    },

    /** Save preferences: ภาษา + เขตเวลา */
    async updatePreferences(userId: number, language: 'th' | 'en', timezone: string): Promise<AccountDto> {
      await load(userId);
      return toAccount(secrets, await db.user.update({ where: { id: userId }, data: { language, timezone } }));
    },

    /** เปลี่ยนอีเมล: ต้องยืนยันรหัสผ่านปัจจุบัน และไม่ซ้ำกับบัญชีอื่น */
    async updateEmail(userId: number, emailInput: string, password: string): Promise<AccountDto> {
      const user = await loadWithPassword(userId, password);
      const email = normalizeEmail(emailInput);
      if (email === user.email) throw new HttpError(400, 'This is already your email.');
      const taken = await db.user.findUnique({ where: { email }, select: { id: true } });
      if (taken) throw new HttpError(409, 'This email is already used by another account.');
      try {
        return toAccount(secrets, await db.user.update({ where: { id: userId }, data: { email } }));
      } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
          throw new HttpError(409, 'This email is already used by another account.');
        }
        throw error;
      }
    },

    /** เปลี่ยนรหัสผ่าน: เพิ่ม tokenVersion (token เก่าทุกอันใช้ไม่ได้) แล้วออก token ใหม่ให้เครื่องนี้ใช้ต่อ */
    async changePassword(userId: number, current: string, next: string): Promise<{ token: string }> {
      const user = await loadWithPassword(userId, current);
      if (await bcrypt.compare(next, user.passwordHash)) {
        throw new HttpError(400, 'Choose a password different from your current one.');
      }
      const updated = await db.user.update({
        where: { id: userId },
        data: { passwordHash: await hashPassword(next), tokenVersion: { increment: 1 } },
      });
      return { token: signToken(secrets, updated) };
    },

    /** ดูรหัสกู้คืนซ้ำ: ยืนยันรหัสผ่านก่อน (ถอดรหัสให้เฉพาะ endpoint นี้ ไม่เก็บ ไม่ log) */
    async showRecoveryCode(userId: number, password: string): Promise<string> {
      const user = await loadWithPassword(userId, password);
      return decryptRecoveryCode(user.recoveryCode, secrets.recoveryKey);
    },

    /** ลบบัญชี: แถว User ถูกลบ ข้อมูลลูกทั้งหมดลบตาม (cascade) และลบไฟล์ของผู้ใช้ออกจากดิสก์ */
    async deleteAccount(userId: number): Promise<void> {
      await load(userId);
      await db.user.delete({ where: { id: userId } });
      removeFolder(dataDir, `attachments/${userId}`);
      removeFolder(dataDir, `avatars/${userId}`);
    },

    /** ไฟล์รูปโปรไฟล์สำหรับส่งกลับ (เรียกหลังตรวจลายเซ็นของ URL แล้ว) */
    async readAvatar(userId: number, file: string) {
      const user = await db.user.findUnique({ where: { id: userId }, select: { avatar: true } });
      if (!user?.avatar || user.avatar !== `avatars/${userId}/${file}` || !fileExists(dataDir, user.avatar)) {
        throw new HttpError(404, 'This file no longer exists.');
      }
      return filePath(dataDir, user.avatar);
    },
  };
}
