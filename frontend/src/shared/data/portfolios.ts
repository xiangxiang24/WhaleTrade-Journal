import type { Portfolio, PortfolioFormValues, TrashedPortfolio } from '../types/portfolio'
import { countPlansOfPortfolio, detachPlansFromPortfolio } from './calc-plans'
import { deleteTransactionsOfPortfolio, summarizePortfolio } from './transactions'

// ที่เก็บข้อมูลจำลองของพอร์ต (ในหน่วยความจำ ใช้ร่วมกันทุกหน้า เช่น Trash / Portfolio Detail ภายหลัง)
// ไฟล์เดียวที่ต้องแก้ตอนต่อ backend; รีเฟรชแล้วกลับเป็นค่าเริ่มต้น
type StoredPortfolio = Omit<Portfolio, 'reached' | 'totalDca' | 'entries'>

// reached / totalDca / entries คำนวณจาก transaction ทุกครั้งที่ขอ (ไม่เก็บเป็นตัวเลขแยก) จึงตรงกับหน้า Transaction Logs เสมอ
let store: StoredPortfolio[] = [
  {
    id: 1,
    name: 'Dividend Sanctuary',
    tagline: 'Anchor Portfolio',
    description:
      'Sheltered from market volatility. Cultivating patient capital where cashflow ripens at its own organic pace.',
    icon: 'leaf',
    annualGoal: 250_000,
    updatedAt: '2026-01-05T05:00:00Z',
    deletedAt: null,
  },
  {
    id: 2,
    name: 'Rainy Day Nest',
    tagline: 'Safe Cushion',
    description: 'A calm cushion for the unexpected. Small, steady, and always within reach.',
    icon: 'bag',
    annualGoal: 20_000,
    updatedAt: '2026-01-05T05:00:00Z',
    deletedAt: null,
  },
  {
    id: 3,
    name: 'Quiet Growth',
    tagline: 'Core Compounding',
    description: 'Core holdings left to compound quietly, one monthly deposit at a time.',
    icon: 'pot',
    annualGoal: 60_000,
    updatedAt: '2026-01-05T05:00:00Z',
    deletedAt: null,
  },
  // อยู่ในถังขยะ (ไว้ดูหน้า Trash)
  {
    id: 4,
    name: 'Old Thai Dividend Set',
    tagline: 'Retired Strategy',
    description: 'An earlier set of Thai dividend stocks I stopped adding to after changing my strategy.',
    icon: 'landmark',
    annualGoal: 40_000,
    updatedAt: '2026-08-12T05:00:00Z',
    deletedAt: '2026-10-22T09:15:00Z',
  },
  {
    id: 5,
    name: 'Test Portfolio',
    tagline: null,
    description: null,
    icon: 'pot',
    annualGoal: null,
    updatedAt: '2026-06-03T05:00:00Z',
    deletedAt: '2026-09-30T14:00:00Z',
  },
]

let nextId = 6

// รวมค่าที่คำนวณจาก transaction เข้ากับข้อมูลพอร์ต; Last updated = ล่าสุดระหว่างพอร์ตเองกับ transaction
function withSummary(portfolio: StoredPortfolio): Portfolio {
  const summary = summarizePortfolio(portfolio.id)
  const updatedAt =
    summary.lastChange && summary.lastChange > portfolio.updatedAt ? summary.lastChange : portfolio.updatedAt
  return { ...portfolio, updatedAt, reached: summary.reached, totalDca: summary.totalDca, entries: summary.entries }
}

/** ชื่อพอร์ตทั้งหมดรวมที่อยู่ในถังขยะ (แผนที่บันทึกยังอ้างอิงพอร์ตในถังขยะได้ ตาม database.md) key = id */
export function getPortfolioNames() {
  return new Map(store.map((portfolio) => [portfolio.id, portfolio.name]))
}

const LATENCY_MS = 350
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

// GET /portfolios (เฉพาะ deletedAt ว่าง) จำลองความหน่วงให้เห็นสถานะกำลังโหลด
export async function fetchPortfolios(): Promise<Portfolio[]> {
  await delay()
  return store.filter((portfolio) => portfolio.deletedAt === null).map(withSummary)
}

// GET /portfolios/:id (ไม่พบหรืออยู่ในถังขยะ = null)
export async function fetchPortfolio(id: number): Promise<Portfolio | null> {
  await delay()
  const found = store.find((portfolio) => portfolio.id === id && portfolio.deletedAt === null)
  return found ? withSummary(found) : null
}

// POST /portfolios พอร์ตใหม่ยังไม่มี transaction
export async function createPortfolio(values: PortfolioFormValues): Promise<Portfolio> {
  await delay()
  const created: StoredPortfolio = {
    id: nextId++,
    name: values.name,
    tagline: values.tagline || null,
    description: values.description || null,
    icon: values.icon,
    annualGoal: values.annualGoal,
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  }
  store = [...store, created]
  return withSummary(created)
}

// PATCH /portfolios/:id
export async function updatePortfolio(id: number, values: PortfolioFormValues): Promise<Portfolio> {
  await delay()
  const current = store.find((portfolio) => portfolio.id === id)
  if (!current) throw new Error('This portfolio no longer exists.')
  const updated: StoredPortfolio = {
    ...current,
    name: values.name,
    tagline: values.tagline || null,
    description: values.description || null,
    icon: values.icon,
    annualGoal: values.annualGoal,
    updatedAt: new Date().toISOString(),
  }
  store = store.map((portfolio) => (portfolio.id === id ? updated : portfolio))
  return withSummary(updated)
}

// DELETE /portfolios/:id = soft delete (ตั้ง deletedAt) transaction ไม่ถูกลบ
export async function trashPortfolio(id: number): Promise<void> {
  await delay()
  const current = store.find((portfolio) => portfolio.id === id)
  if (!current) throw new Error('This portfolio no longer exists.')
  store = store.map((portfolio) =>
    portfolio.id === id ? { ...portfolio, deletedAt: new Date().toISOString() } : portfolio,
  )
}

// POST /portfolios/:id/restore (ล้าง deletedAt) ใช้กับปุ่ม Undo และหน้า Trash
export async function restorePortfolio(id: number): Promise<Portfolio> {
  await delay()
  const current = store.find((portfolio) => portfolio.id === id)
  if (!current) throw new Error('This portfolio no longer exists.')
  const restored: StoredPortfolio = { ...current, deletedAt: null }
  store = store.map((portfolio) => (portfolio.id === id ? restored : portfolio))
  return withSummary(restored)
}

// ===== ถังขยะของพอร์ต =====
// GET /portfolios?trashed=true (ลบล่าสุดก่อน) พร้อมจำนวนแผนที่อ้างอิงพอร์ต
export async function fetchTrashedPortfolios(): Promise<TrashedPortfolio[]> {
  await delay()
  return store
    .filter((portfolio): portfolio is StoredPortfolio & { deletedAt: string } => portfolio.deletedAt !== null)
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt))
    .map((portfolio) => ({ ...withSummary(portfolio), deletedAt: portfolio.deletedAt, planCount: countPlansOfPortfolio(portfolio.id) }))
}

// DELETE /portfolios/:id?permanent=true ลบพอร์ต + transaction ถาวร แผนที่อ้างอิงเปลี่ยนเป็น "กรอกเอง"
export async function purgePortfolio(id: number): Promise<void> {
  await delay()
  const current = store.find((portfolio) => portfolio.id === id && portfolio.deletedAt !== null)
  if (!current) throw new Error('This portfolio is no longer in the trash.')
  store = store.filter((portfolio) => portfolio.id !== id)
  deleteTransactionsOfPortfolio(id)
  detachPlansFromPortfolio(id)
}

// DELETE /portfolios/trash ล้างถังขยะของพอร์ต แล้วคืนจำนวนที่ลบ
export async function emptyPortfolioTrash(): Promise<number> {
  await delay()
  const ids = store.filter((portfolio) => portfolio.deletedAt !== null).map((portfolio) => portfolio.id)
  store = store.filter((portfolio) => portfolio.deletedAt === null)
  ids.forEach((id) => {
    deleteTransactionsOfPortfolio(id)
    detachPlansFromPortfolio(id)
  })
  return ids.length
}
