import 'dotenv/config';
import path from 'node:path';
import { createDb } from './db/client.js';
import { startServer } from './index.js';

// ใช้ตอนพัฒนาเท่านั้น (รันด้วย tsx ผ่าน npm run dev:server) แอปจริงเปิด server จาก electron/main.ts
const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const db = createDb(path.resolve(dbUrl.replace(/^file:/, '')));
const port = Number(process.env.PORT ?? 3001);
startServer(db, port);
console.log(`API ready at http://127.0.0.1:${port}`);
