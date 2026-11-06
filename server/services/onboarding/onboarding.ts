import bcrypt from 'bcrypt';
import type { AppContext } from '../../context.js';
import { HttpError } from '../../middleware/http-error.js';
import { BCRYPT_COST, hashPassword, normalizeEmail, signToken, toAccount, type UserRow } from '../shared/auth.js';
import { encryptRecoveryCode, generateRecoveryCode, recoveryCodeMatches } from '../shared/recovery-code.js';

// hash หลอกไว้เทียบเมื่อไม่พบอีเมล เพื่อให้เวลาตอบใกล้เคียงกับกรณีพบอีเมล (ไม่บอกว่าอีเมลนี้มีบัญชีหรือไม่)
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST);

export type RegisterInput = { fullName: string; displayName: string; email: string; password: string };

export function onboardingService({ db, secrets }: AppContext) {
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
            passwordHash: await hashPassword(input.password),
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
      return { token: signToken(secrets, user), account: toAccount(secrets, user), recoveryCode };
    },

    async login(emailInput: string, password: string) {
      const user = await db.user.findUnique({ where: { email: normalizeEmail(emailInput) } });
      const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
      if (!user || !valid) throw new HttpError(401, 'Incorrect email or password.');
      return { token: signToken(secrets, user), account: toAccount(secrets, user) };
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
        data: { passwordHash: await hashPassword(newPassword), tokenVersion: { increment: 1 } },
      });
    },

    async getAccount(userId: number) {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) throw new HttpError(401, 'Your session has expired. Please log in again.');
      return toAccount(secrets, user);
    },
  };
}
