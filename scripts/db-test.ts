import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client.js';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const user = await prisma.user.create({
  data: { email: `test${Date.now()}@example.com`, displayName: 'Whale', passwordHash: 'x' },
});
console.log('สร้างแล้ว:', user);
console.log('ทั้งหมด:', await prisma.user.findMany());

await prisma.$disconnect();