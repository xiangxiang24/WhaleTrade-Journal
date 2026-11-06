import type { AppContext } from '../context.js';
import { trashService } from '../services/trash.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: ถังขยะของโน้ตและพอร์ต
export function trashController(ctx: AppContext) {
  const service = trashService(ctx);
  return { service };
}
