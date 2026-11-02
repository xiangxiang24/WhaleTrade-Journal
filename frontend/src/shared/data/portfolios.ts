import type { Portfolio, PortfolioFormValues } from '../types/portfolio'

// ที่เก็บข้อมูลจำลองของพอร์ต (ในหน่วยความจำ ใช้ร่วมกันทุกหน้า เช่น Trash / Portfolio Detail ภายหลัง)
// ไฟล์เดียวที่ต้องแก้ตอนต่อ backend; รีเฟรชแล้วกลับเป็นค่าเริ่มต้น
let store: Portfolio[] = [
  {
    id: 1,
    name: 'Dividend Sanctuary',
    tagline: 'Anchor Portfolio',
    icon: 'leaf',
    annualGoal: 2_000_000,
    reached: 800_000,
    totalDca: 1_450_000,
    entries: 28,
    updatedAt: '2026-10-08T05:00:00Z',
    deletedAt: null,
  },
  {
    id: 2,
    name: 'Rainy Day Nest',
    tagline: 'Safe Cushion',
    icon: 'bag',
    annualGoal: 300_000,
    reached: 300_000,
    totalDca: 300_000,
    entries: 19,
    updatedAt: '2026-09-30T05:00:00Z',
    deletedAt: null,
  },
  {
    id: 3,
    name: 'Quiet Growth',
    tagline: 'Core Compounding',
    icon: 'pot',
    annualGoal: 1_000_000,
    reached: 650_000,
    totalDca: 620_000,
    entries: 41,
    updatedAt: '2026-10-04T05:00:00Z',
    deletedAt: null,
  },
]

let nextId = 4

const LATENCY_MS = 350
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

// GET /portfolios (เฉพาะ deletedAt ว่าง) จำลองความหน่วงให้เห็นสถานะกำลังโหลด
export async function fetchPortfolios(): Promise<Portfolio[]> {
  await delay()
  return store.filter((portfolio) => portfolio.deletedAt === null).map((portfolio) => ({ ...portfolio }))
}

// POST /portfolios พอร์ตใหม่ยังไม่มี transaction
export async function createPortfolio(values: PortfolioFormValues): Promise<Portfolio> {
  await delay()
  const created: Portfolio = {
    id: nextId++,
    name: values.name,
    tagline: values.tagline || null,
    icon: values.icon,
    annualGoal: values.annualGoal,
    reached: 0,
    totalDca: 0,
    entries: 0,
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  }
  store = [...store, created]
  return { ...created }
}

// PATCH /portfolios/:id
export async function updatePortfolio(id: number, values: PortfolioFormValues): Promise<Portfolio> {
  await delay()
  const current = store.find((portfolio) => portfolio.id === id)
  if (!current) throw new Error('This portfolio no longer exists.')
  const updated: Portfolio = {
    ...current,
    name: values.name,
    tagline: values.tagline || null,
    icon: values.icon,
    annualGoal: values.annualGoal,
    updatedAt: new Date().toISOString(),
  }
  store = store.map((portfolio) => (portfolio.id === id ? updated : portfolio))
  return { ...updated }
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
  const restored: Portfolio = { ...current, deletedAt: null }
  store = store.map((portfolio) => (portfolio.id === id ? restored : portfolio))
  return { ...restored }
}
