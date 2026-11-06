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

/** นำเข้ารายชื่อจาก seed/assets.json ทำซ้ำได้ไม่ซ้ำรายการ (unique market + ticker) ตอนเปิดแอป */
export async function importAssets(db: Db, file: string): Promise<number> {
  if (!fs.existsSync(file)) return 0;
  const seed = JSON.parse(fs.readFileSync(file, 'utf8')) as SeedAsset[];
  for (const asset of seed) {
    await db.asset.upsert({
      where: { market_ticker: { market: asset.market, ticker: asset.ticker } },
      update: { name: asset.name, type: asset.type, sector: asset.sector },
      create: { ...asset, source: 'seed' },
    });
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
