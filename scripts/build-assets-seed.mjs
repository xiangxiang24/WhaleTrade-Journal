// สร้าง seed/assets.json = หุ้น/กองทุนสหรัฐทั้งหมดจาก Nasdaq Trader (ฟรี ทางการ) + รายชื่อไทยใน seed/thai-assets.txt
// รัน: node scripts/build-assets-seed.mjs   (ต้องต่ออินเทอร์เน็ต)
import fs from 'node:fs';

const BASE = 'https://www.nasdaqtrader.com/dynamic/SymDir';

async function load(file) {
  const response = await fetch(`${BASE}/${file}`);
  if (!response.ok) throw new Error(`${file}: ${response.status}`);
  return (await response.text()).split(/\r?\n/).filter((line) => line && !line.startsWith('File Creation Time'));
}

// ตัวที่ไม่ใช่หุ้น/กองทุนทั่วไป: warrant, right, unit, หุ้นบุริมสิทธิ, ตราสารหนี้ที่จดทะเบียนเป็นตัวอักษร
const SKIP_NAME = /\b(warrants?|rights?|units?|notes? due|preferred|depositary shares? each representing|% (cumulative|senior|subordinated))\b|\d%/i;
const SUFFIX = /\s*-?\s*(Class [A-Z] )?(Common Stock|Common Shares|Ordinary Shares|Ordinary Share|Shares of Beneficial Interest|Common Units?|American Depositary Shares?|Depositary Shares?)\b.*$/i;
const clean = (name) => name.replace(SUFFIX, '').replace(/\s+-\s+.*$/, '').replace(/\s+/g, ' ').trim() || name.trim();

function parse(lines, symbolCol, nameCol, etfCol, testCol) {
  const [, ...rows] = lines;
  const out = [];
  for (const row of rows) {
    const cols = row.split('|');
    const ticker = cols[symbolCol]?.trim();
    const rawName = cols[nameCol]?.trim() ?? '';
    if (!ticker || !/^[A-Z0-9.\-]+$/.test(ticker) || cols[testCol] === 'Y') continue;
    const isEtf = cols[etfCol] === 'Y';
    if (!isEtf && SKIP_NAME.test(rawName)) continue;
    out.push({ ticker, name: isEtf ? rawName : clean(rawName), type: isEtf ? 'fund' : 'stock', market: 'US', sector: null });
  }
  return out;
}

const nasdaq = parse(await load('nasdaqlisted.txt'), 0, 1, 6, 3);
const other = parse(await load('otherlisted.txt'), 0, 1, 4, 6);

const thai = fs
  .readFileSync(new URL('../seed/thai-assets.txt', import.meta.url), 'utf8')
  .split('\n')
  .filter((line) => line.trim() && !line.startsWith('#'))
  .map((line) => {
    const [market, ticker, name, type, sector] = line.split('|');
    return { ticker, name, type, market, sector: sector || null };
  });

// รายชื่อไทยที่เขียนเองมาก่อน (ชื่อ/หมวดที่ตั้งใจไว้ชนะรายการอัตโนมัติ)
const merged = new Map();
for (const asset of [...nasdaq, ...other, ...thai]) merged.set(`${asset.market}:${asset.ticker}`, asset);
const all = [...merged.values()].sort((a, b) => a.market.localeCompare(b.market) || a.ticker.localeCompare(b.ticker));
fs.writeFileSync(new URL('../seed/assets.json', import.meta.url), `${JSON.stringify(all)}\n`);
console.log(`US ${nasdaq.length + other.length}, Thai ${thai.length}, total ${all.length}`);
