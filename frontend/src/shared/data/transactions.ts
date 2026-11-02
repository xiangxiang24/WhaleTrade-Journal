import { runRate, totalDca } from './portfolio-math'
import type { Transaction, TransactionFormValues } from '../types/transaction'

// ที่เก็บข้อมูลจำลองของ transaction (ในหน่วยความจำ ใช้ร่วมกันทุกหน้า) ไฟล์เดียวที่ต้องแก้ตอนต่อ backend
// ข้อมูลตั้งต้นสร้างจาก "วันนี้" ย้อนหลังเป็นเดือน เพื่อให้ Run-Rate (ปันผล 12 เดือนล่าสุด) มีค่าเสมอไม่ว่าเปิดวันไหน
const NOW = new Date()

function dateMonthsAgo(monthsAgo: number, day: number) {
  const safeDay = monthsAgo === 0 ? Math.min(day, NOW.getUTCDate()) : day
  return new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth() - monthsAgo, safeDay)).toISOString().slice(0, 10)
}

const BASE_PRICE: Record<number, number> = { 1: 100, 2: 130, 3: 1.8, 4: 140, 5: 100, 6: 220, 7: 55, 8: 270, 9: 60, 10: 2000 }
const TAGS: Record<number, string> = { 1: 'Core', 2: 'Pillar', 3: 'High Dividend', 4: 'Core', 5: 'Pillar', 6: 'Core', 7: 'Core', 8: 'High Dividend', 9: 'Pillar', 10: 'Core' }
const DIVIDEND_NOTES = ['Semiannual pay', 'High payout ratio', 'Quarterly pay', 'Special dividend']

let store: Transaction[] = []
let nextId = 1
/** เวลาที่ transaction ของแต่ละพอร์ตถูกเพิ่ม/แก้/ลบล่าสุด ใช้เป็น "Last updated" ของพอร์ต */
const lastChange = new Map<number, string>()

function seed(
  portfolioId: number,
  spec: {
    assets: number[]
    /** ซื้อ DCA รายเดือน: จำนวนครั้ง ยอดรวม และจำนวนเดือนที่ย้อนไป */
    buys: { count: number; total: number; spanMonths: number }
    /** ปันผล: ยอดแต่ละครั้ง (ภายใน 12 เดือนล่าสุด) */
    dividends: number[]
    sells: number
  },
) {
  const { assets, buys, dividends, sells } = spec
  const base = Math.floor(buys.total / buys.count / 100) * 100
  const boughtUnits = new Map<number, number>()

  for (let i = 0; i < buys.count; i++) {
    const assetId = assets[i % assets.length]
    const amount = i === buys.count - 1 ? buys.total - base * (buys.count - 1) : base
    const units = Math.max(100, Math.round(amount / BASE_PRICE[assetId] / 100) * 100)
    const monthsAgo = buys.spanMonths - Math.floor((i * buys.spanMonths) / buys.count)
    boughtUnits.set(assetId, (boughtUnits.get(assetId) ?? 0) + units)
    push({
      portfolioId,
      assetId,
      type: 'buy',
      date: dateMonthsAgo(monthsAgo, 5),
      price: Math.round((amount / units) * 100) / 100,
      units,
      fee: 0,
      amount: null,
      note: 'Monthly DCA',
      tag: TAGS[assetId],
    })
  }

  dividends.forEach((amount, i) => {
    const assetId = assets[i % assets.length]
    push({
      portfolioId,
      assetId,
      type: 'dividend',
      date: dateMonthsAgo(11 - Math.floor((i * 11) / Math.max(1, dividends.length - 1)), 18),
      price: null,
      units: boughtUnits.get(assetId) ?? null,
      fee: null,
      amount,
      note: DIVIDEND_NOTES[i % DIVIDEND_NOTES.length],
      tag: TAGS[assetId],
    })
  })

  for (let i = 0; i < sells; i++) {
    const assetId = assets[i % assets.length]
    const units = Math.floor(((boughtUnits.get(assetId) ?? 0) * 0.1) / 100) * 100
    push({
      portfolioId,
      assetId,
      type: 'sell',
      date: dateMonthsAgo(2 + i, 22),
      price: Math.round(BASE_PRICE[assetId] * 1.1 * 100) / 100,
      units,
      fee: 25,
      amount: null,
      note: 'Rebalance',
      tag: TAGS[assetId],
    })
  }
}

function push(values: Omit<Transaction, 'id' | 'updatedAt'>) {
  const date = values.date
  store.push({ ...values, id: nextId++, updatedAt: `${date}T05:00:00Z` })
  const current = lastChange.get(values.portfolioId)
  const stamp = `${date}T05:00:00Z`
  if (!current || stamp > current) lastChange.set(values.portfolioId, stamp)
}

// พอร์ต 1: Run-Rate 100,000 (40% ของเป้า 250,000) / พอร์ต 2: ถึงเป้า / พอร์ต 3: 65%
seed(1, { assets: [1, 2, 3, 5, 4], buys: { count: 18, total: 1_450_000, spanMonths: 24 }, dividends: [18_000, 12_000, 14_000, 9_000, 16_000, 11_000, 8_000, 12_000], sells: 2 })
seed(2, { assets: [5, 8, 7], buys: { count: 15, total: 300_000, spanMonths: 15 }, dividends: [6_000, 5_000, 4_500, 5_500], sells: 0 })
seed(3, { assets: [6, 9, 7, 8, 4, 1], buys: { count: 30, total: 620_000, spanMonths: 30 }, dividends: [4_000, 3_500, 4_500, 3_000, 4_000, 3_500, 4_000, 3_500, 4_500, 4_500], sells: 1 })

const LATENCY_MS = 300
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

// GET /portfolios/:id/transactions (ใหม่ → เก่า)
export async function fetchTransactions(portfolioId: number): Promise<Transaction[]> {
  await delay()
  return store
    .filter((tx) => tx.portfolioId === portfolioId)
    .map((tx) => ({ ...tx }))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
}

function toTransaction(portfolioId: number, values: TransactionFormValues): Omit<Transaction, 'id' | 'updatedAt'> {
  const dividend = values.type === 'dividend'
  return {
    portfolioId,
    assetId: values.assetId,
    type: values.type,
    date: values.date,
    price: dividend ? null : values.price,
    units: values.units,
    fee: dividend ? null : values.fee,
    amount: dividend ? values.amount : null,
    note: values.note.trim() || null,
    tag: values.tag.trim() || null,
  }
}

function touch(portfolioId: number) {
  lastChange.set(portfolioId, new Date().toISOString())
}

// POST /portfolios/:id/transactions
export async function createTransaction(portfolioId: number, values: TransactionFormValues): Promise<Transaction> {
  await delay()
  const created: Transaction = { ...toTransaction(portfolioId, values), id: nextId++, updatedAt: new Date().toISOString() }
  store = [...store, created]
  touch(portfolioId)
  return { ...created }
}

// PATCH /transactions/:id (ตรวจผ่าน portfolio.userId เสมอ)
export async function updateTransaction(id: number, values: TransactionFormValues): Promise<Transaction> {
  await delay()
  const current = store.find((tx) => tx.id === id)
  if (!current) throw new Error('This transaction no longer exists.')
  const updated: Transaction = { ...toTransaction(current.portfolioId, values), id, updatedAt: new Date().toISOString() }
  store = store.map((tx) => (tx.id === id ? updated : tx))
  touch(current.portfolioId)
  return { ...updated }
}

// DELETE /transactions/:id (ลบจริง ไม่มีถังขยะ)
export async function deleteTransaction(id: number): Promise<void> {
  await delay()
  const current = store.find((tx) => tx.id === id)
  if (!current) throw new Error('This transaction no longer exists.')
  store = store.filter((tx) => tx.id !== id)
  touch(current.portfolioId)
}

/** ค่าบนการ์ดในหน้ารายการพอร์ต (อ่านจาก transaction ตามสูตรเดียวกับหน้ารายละเอียด) */
export function summarizePortfolio(portfolioId: number) {
  const own = store.filter((tx) => tx.portfolioId === portfolioId)
  return {
    reached: Math.round(runRate(own)),
    totalDca: Math.round(totalDca(own)),
    entries: own.length,
    lastChange: lastChange.get(portfolioId) ?? null,
  }
}
