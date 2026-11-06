import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { AppContext } from '../context.js';
import { HttpError } from '../middleware/http-error.js';
import { encryptRecoveryCode, generateRecoveryCode, recoveryCodeMatches } from './recovery-code.js';

const BCRYPT_COST = 12;
const TOKEN_TTL = '30d';

export type RegisterInput = { fullName: string; displayName: string; email: string; password: string };

/** บัญชีที่ส่งให้หน้าจอ (ตรงกับ type Account ฝั่ง frontend ไม่รวม passwordHash / recoveryCode) */
export type AccountDto = {
  fullName: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  language: 'th' | 'en';
  timezone: string;
};

type UserRow = {
  id: number;
  email: string;
  fullName: string;
  displayName: string;
  avatar: string | null;
  language: string;
  timezone: string;
  tokenVersion: number;
};

// hash หลอกไว้เทียบเมื่อไม่พบอีเมล เพื่อให้เวลาตอบใกล้เคียงกับกรณีพบอีเมล (ไม่บอกว่าอีเมลนี้มีบัญชีหรือไม่)
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST);

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function toAccount(user: UserRow): AccountDto {
  return {
    fullName: user.fullName,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatar,
    language: user.language === 'en' ? 'en' : 'th',
    timezone: user.timezone,
  };
}

export function onboardingService({ db, secrets }: AppContext) {
  const signToken = (user: Pick<UserRow, 'id' | 'tokenVersion'>) =>
    jwt.sign({ tv: user.tokenVersion }, secrets.jwtSecret, {
      algorithm: 'HS256',
      subject: String(user.id),
      expiresIn: TOKEN_TTL,
    });

  return {
    /** สมัครสมาชิก: คืน token + บัญชี + รหัสกู้คืน (เห็นครั้งเดียวตอนสมัคร ดูซ้ำได้ใน Setting หลังยืนยันรหัสผ่าน) */
    async register(input: RegisterInput) {
      const email = normalizeEmail(input.email);
      if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
        throw new HttpError(409, 'This email is already used by another account.');
      }
      const recoveryCode = generateRecoveryCode();
      let user: UserRow;
      try {
        user = await db.user.create({
          data: {
            email,
            fullName: input.fullName.trim(),
            displayName: input.displayName.trim() || input.fullName.trim(),
            passwordHash: await bcrypt.hash(input.password, BCRYPT_COST),
            recoveryCode: encryptRecoveryCode(recoveryCode, secrets.recoveryKey),
          },
        });
      } catch (error) {
        // สมัครพร้อมกันสองคำขอด้วยอีเมลเดียวกัน (unique ชน)
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
          throw new HttpError(409, 'This email is already used by another account.');
        }
        throw error;
      }
      return { token: signToken(user), account: toAccount(user), recoveryCode };
    },

    async login(emailInput: string, password: string) {
      const user = await db.user.findUnique({ where: { email: normalizeEmail(emailInput) } });
      const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
      if (!user || !valid) throw new HttpError(401, 'Incorrect email or password.');
      return { token: signToken(user), account: toAccount(user) };
    },

    /** ลืมรหัสผ่าน: อีเมล + รหัสกู้คืนถูกต้อง → ตั้งรหัสผ่านใหม่ และเพิ่ม tokenVersion (token เก่าใช้ไม่ได้) */
    async recoverPassword(emailInput: string, recoveryCode: string, newPassword: string) {
      const user = await db.user.findUnique({ where: { email: normalizeEmail(emailInput) } });
      const matches = user
        ? recoveryCodeMatches(user.recoveryCode, recoveryCode, secrets.recoveryKey)
        : false;
      if (!user || !matches) throw new HttpError(401, 'The email or recovery code is incorrect.');
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(newPassword, BCRYPT_COST), tokenVersion: { increment: 1 } },
      });
    },

    async getAccount(userId: number) {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) throw new HttpError(401, 'Your session has expired. Please log in again.');
      return toAccount(user);
    },
  };
}
