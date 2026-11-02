import type { CalcInput, CalcOutput } from '../types/calc-plan'

// ตัวคำนวณชั่วคราวสำหรับข้อมูลจำลอง: ปันผลเฉลี่ยทบต้นรายเดือนบนยอดสะสม (ไม่สมมติราคาหุ้นโต)
// ตรรกะจริงให้ไปทำที่ backend ตามที่ตกลงไว้ ฟังก์ชันนี้เป็นฟังก์ชันล้วน (เหมือนที่ database.md ระบุ) จึงย้ายได้โดยไม่แตะหน้าจอ:
// รับ CalcInput ส่ง CalcOutput แล้วแก้ใน `use-calculator.ts` จุดที่เรียก `calculatePlan` จุดเดียว
export function calculatePlan({ principal, phases, avgYieldPct }: CalcInput): CalcOutput {
  const monthlyRate = avgYieldPct / 100 / 12
  let balance = principal
  let totalDca = 0
  const phaseTotals: number[] = []

  for (const phase of phases) {
    const months = phase.years * 12
    for (let month = 0; month < months; month++) balance = balance * (1 + monthlyRate) + phase.monthlyDca
    const phaseDca = months * phase.monthlyDca
    phaseTotals.push(phaseDca)
    totalDca += phaseDca
  }

  const totalInvested = principal + totalDca
  const total = Math.round(balance)
  const dividends = Math.max(0, total - totalInvested)
  const base = total > 0 ? total : 1
  return {
    totalInvested,
    totalDca,
    dividends,
    total,
    increasePct: totalInvested > 0 ? (dividends / totalInvested) * 100 : 0,
    shares: { principal: (principal / base) * 100, dca: (totalDca / base) * 100, dividends: (dividends / base) * 100 },
    phaseTotals,
    years: phases.reduce((sum, phase) => sum + phase.years, 0),
  }
}
