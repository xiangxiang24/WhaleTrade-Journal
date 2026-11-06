import type { ErrorRequestHandler } from 'express';

/** ข้อผิดพลาดที่ตอบกลับผู้ใช้ได้ตรงๆ (ข้อความเป็นภาษาอังกฤษ ให้ frontend แปลด้วย t() ตอนแสดง) */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** ตัวจัดการ error กลาง: HttpError ตอบตามที่ตั้ง, JSON พัง = 400, อื่นๆ = 500 (ไม่รั่วรายละเอียด ไม่ log ข้อมูลลับ) */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: 'The request could not be read.' });
    return;
  }
  console.error('Unhandled error:', error instanceof Error ? error.name : 'unknown');
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
};
