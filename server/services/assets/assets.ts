import fs from 'node:fs';
import type { AppContext } from '../../context.js';
import type { Db } from '../../db/client.js';

/** รูปเดียวกับ type Asset ฝั่ง frontend (ตาราง Asset อ่านอย่างเดียว ใช้ร่วมกันทั้งแอป ไม่ผูกกับผู้ใช้) */
export type AssetDto = {
  id: number;
  ticker: string;
  name: string;
  type: 'stock' | 'fund';
  market: string;
  sector: string | null;
};

type AssetRow = { id: number; ticker: string; name: string; type: string; market: string; sector: string | null };

export const toAssetDto = (asset: AssetRow): AssetDto => ({
  id: asset.id,
  ticker: asset.ticker,
  name: asset.name,
  type: asset.type === 'fund' ? 'fund' : 'stock',
  market: asset.market,
  sector: asset.sector,
});

type SeedAsset = { ticker: string; name: string; type: string; market: string; sector: string | null };

/** นำเข้ารายชื่อจาก seed/assets.json ทำซ้ำได้ไม่ซ้ำรายการ (unique market + ticker) ตอนเปิดแอป
 * รายชื่อมีหมื่นกว่าตัว จึงเพิ่มของใหม่เป็นชุดเดียว และแก้เฉพาะรายการที่ชื่อ/ชนิด/หมวดเปลี่ยน (คง id เดิมที่ธุรกรรมอ้างอยู่) */
export async function importAssets(db: Db, file: string): Promise<number> {
  if (!fs.existsSync(file)) return 0;
  const seed = JSON.parse(fs.readFileSync(file, 'utf8')) as SeedAsset[];
  const existing = new Map((await db.asset.findMany()).map((row) => [`${row.market}:${row.ticker}`, row]));

  const fresh = seed.filter((asset) => !existing.has(`${asset.market}:${asset.ticker}`));
  for (let start = 0; start < fresh.length; start += 500) {
    await db.asset.createMany({ data: fresh.slice(start, start + 500).map((asset) => ({ ...asset, source: 'seed' })) });
  }
  for (const asset of seed) {
    const row = existing.get(`${asset.market}:${asset.ticker}`);
    if (row && (row.name !== asset.name || row.type !== asset.type || row.sector !== asset.sector)) {
      await db.asset.update({ where: { id: row.id }, data: { name: asset.name, type: asset.type, sector: asset.sector } });
    }
  }
  return seed.length;
}

export function assetsService({ db }: AppContext) {
  return {
    /** ค้นจากชื่อหรือ ticker (ไม่สนตัวพิมพ์ใหญ่เล็ก) ไม่ส่ง query = ทั้งหมด */
    async search(query: string, limit: number): Promise<AssetDto[]> {
      const keyword = query.trim();
      const rows = await db.asset.findMany({
        where: keyword ? { OR: [{ ticker: { contains: keyword } }, { name: { contains: keyword } }] } : undefined,
        orderBy: [{ market: 'asc' }, { ticker: 'asc' }],
        take: limit,
      });
      return rows.map(toAssetDto);
    },

    async byIds(ids: number[]): Promise<AssetDto[]> {
      const rows = await db.asset.findMany({ where: { id: { in: ids } }, orderBy: { id: 'asc' } });
      return rows.map(toAssetDto);
    },
  };
}
