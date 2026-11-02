import { ASSET_BY_ID } from './assets'
import type { Asset, Transaction } from '../types/transaction'

// สูตรของพอร์ต (database.md หัวข้อ 4) คำนวณจาก transaction ทุกครั้ง ไม่เก็บเป็นตัวเลขแยก ใช้ร่วมกันระหว่างหน้า Portfolio และ Transaction Logs

const round2 = (value: number) => Math.round(value * 100) / 100

/** ต้นทุนของรายการซื้อ = ราคา × หน่วย + ค่าธรรมเนียม */
export function buyCost(tx: Transaction) {
  return round2((tx.price ?? 0) * (tx.units ?? 0) + (tx.fee ?? 0))
}

/** ยอดเงินของรายการที่แสดงในคอลัมน์ AMOUNT: ซื้อ = ต้นทุน, ขาย = ยอดรับสุทธิ, ปันผล = amount */
export function txAmount(tx: Transaction) {
  if (tx.type === 'buy') return buyCost(tx)
  if (tx.type === 'sell') return round2((tx.price ?? 0) * (tx.units ?? 0) - (tx.fee ?? 0))
  return tx.amount ?? 0
}

const todayString = (asOf: Date) => asOf.toISOString().slice(0, 10)

function twelveMonthsBefore(asOf: Date) {
  const cutoff = new Date(Date.UTC(asOf.getUTCFullYear() - 1, asOf.getUTCMonth(), asOf.getUTCDate()))
  return cutoff.toISOString().slice(0, 10)
}

/** ปันผลที่บันทึกใน 12 เดือนล่าสุด (นับถึงวันนี้) ของ transaction ที่ส่งมา */
function dividendsInLastYear(txs: Transaction[], asOf: Date) {
  const from = twelveMonthsBefore(asOf)
  const to = todayString(asOf)
  return txs.filter((tx) => tx.type === 'dividend' && tx.date >= from && tx.date <= to)
}

/** Current Yield Run-Rate = Σ ปันผล 12 เดือนล่าสุด */
export function runRate(txs: Transaction[], asOf = new Date()) {
  return round2(dividendsInLastYear(txs, asOf).reduce((sum, tx) => sum + (tx.amount ?? 0), 0))
}

/** Total Recorded DCA = Σ ต้นทุนของรายการซื้อ */
export function totalDca(txs: Transaction[]) {
  return round2(txs.filter((tx) => tx.type === 'buy').reduce((sum, tx) => sum + buyCost(tx), 0))
}

/** เดือน (YYYY-MM) ที่มีรายการซื้ออย่างน้อย 1 รายการ เรียงเก่า → ใหม่ */
export function depositMonths(txs: Transaction[]) {
  return [...new Set(txs.filter((tx) => tx.type === 'buy').map((tx) => tx.date.slice(0, 7)))].sort()
}

export type DcaPoint = { month: string; cumulative: number }

/** ยอด DCA สะสมรายเดือนตั้งแต่เดือนซื้อแรกถึงล่าสุด (เดือนที่ไม่มีการซื้อใช้ยอดเดิม) ไว้วาดกราฟเส้น */
export function dcaSeries(txs: Transaction[]): DcaPoint[] {
  const buys = txs.filter((tx) => tx.type === 'buy')
  if (buys.length === 0) return []
  const perMonth = new Map<string, number>()
  for (const tx of buys) perMonth.set(tx.date.slice(0, 7), (perMonth.get(tx.date.slice(0, 7)) ?? 0) + buyCost(tx))
  const months = [...perMonth.keys()].sort()
  const [firstYear, firstMonth] = months[0].split('-').map(Number)
  const [lastYear, lastMonth] = months[months.length - 1].split('-').map(Number)
  const points: DcaPoint[] = []
  let cumulative = 0
  for (let y = firstYear, m = firstMonth; y < lastYear || (y === lastYear && m <= lastMonth); m++) {
    if (m > 12) {
      m = 1
      y++
    }
    const key = `${y}-${String(m).padStart(2, '0')}`
    cumulative += perMonth.get(key) ?? 0
    points.push({ month: key, cumulative: round2(cumulative) })
    if (y === lastYear && m === lastMonth) break
  }
  return points
}

export type Holding = {
  asset: Asset
  /** หน่วยที่ถืออยู่ = Σ ซื้อ − Σ ขาย */
  units: number
  /** ต้นทุนเฉลี่ยต่อหน่วย = Σ ต้นทุนซื้อ ÷ Σ หน่วยซื้อ */
  avgCost: number
  /** ต้นทุนที่ถืออยู่ = หน่วยที่ถืออยู่ × ต้นทุนเฉลี่ย */
  heldCost: number
  /** ปันผล 12 เดือนล่าสุดของ asset นี้ */
  runRate: number
  /** Yield on cost ของ asset นี้ (เปอร์เซ็นต์) */
  yieldPct: number | null
}

/** Holdings ของแต่ละ asset (เฉพาะที่ถืออยู่ > 0) เรียงตามจำนวนหน่วยมาก → น้อย */
export function holdings(txs: Transaction[], asOf = new Date()): Holding[] {
  const result: Holding[] = []
  const assetIds = new Set(txs.map((tx) => tx.assetId))
  for (const assetId of assetIds) {
    const asset = ASSET_BY_ID.get(assetId)
    if (!asset) continue
    const own = txs.filter((tx) => tx.assetId === assetId)
    const bought = own.filter((tx) => tx.type === 'buy')
    const boughtUnits = bought.reduce((sum, tx) => sum + (tx.units ?? 0), 0)
    const soldUnits = own.filter((tx) => tx.type === 'sell').reduce((sum, tx) => sum + (tx.units ?? 0), 0)
    const units = Math.round((boughtUnits - soldUnits) * 1e6) / 1e6
    if (units <= 0) continue
    const avgCost = boughtUnits > 0 ? bought.reduce((sum, tx) => sum + buyCost(tx), 0) / boughtUnits : 0
    const heldCost = round2(units * avgCost)
    const assetRunRate = runRate(own, asOf)
    result.push({
      asset,
      units,
      avgCost,
      heldCost,
      runRate: assetRunRate,
      yieldPct: heldCost > 0 ? (assetRunRate / heldCost) * 100 : null,
    })
  }
  return result.sort((a, b) => b.units - a.units)
}

/** Avg. Yield on Cost (ระดับพอร์ต) = Run-Rate ของ asset ที่ยังถืออยู่ ÷ Σ ต้นทุนที่ถืออยู่ (เปอร์เซ็นต์) */
export function avgYieldOnCost(held: Holding[]) {
  const cost = held.reduce((sum, item) => sum + item.heldCost, 0)
  if (cost <= 0) return null
  return (held.reduce((sum, item) => sum + item.runRate, 0) / cost) * 100
}

/** Next milestone = จุด 25/50/75/100% ของ Goal ที่เล็กที่สุดซึ่งมากกว่า Run-Rate (ถึงเป้าแล้ว = null) */
export function nextMilestone(rate: number, goal: number | null) {
  if (!goal || rate >= goal) return null
  const target = [0.25, 0.5, 0.75, 1].map((step) => goal * step).find((value) => value > rate)
  if (target === undefined) return null
  return { target: Math.round(target), remaining: Math.round(target - rate) }
}
