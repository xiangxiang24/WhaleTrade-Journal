// สูตรเครื่องคำนวณเงินเป้าหมาย: ฟังก์ชันล้วน (รับตัวเลข ส่งผลออก ไม่แตะฐานข้อมูล ไม่ใช้ราคาตลาด ไม่สมมติราคาหุ้นโต)
// ปันผลเฉลี่ยทบต้นรายเดือนบนยอดสะสม ตรงกับ frontend/src/shared/data/calculate-plan.ts

export type PhaseInput = { years: number; monthlyDca: number };

export type CalcInput = {
  principal: number;
  phases: PhaseInput[];
  /** ปันผลเฉลี่ยต่อปี (เปอร์เซ็นต์) */
  avgYieldPct: number;
};

export type CalcOutput = {
  totalInvested: number;
  totalDca: number;
  dividends: number;
  total: number;
  increasePct: number;
  shares: { principal: number; dca: number; dividends: number };
  phaseTotals: number[];
  years: number;
};

export function calculatePlan({ principal, phases, avgYieldPct }: CalcInput): CalcOutput {
  const monthlyRate = avgYieldPct / 100 / 12;
  let balance = principal;
  let totalDca = 0;
  const phaseTotals: number[] = [];

  for (const phase of phases) {
    const months = phase.years * 12;
    for (let month = 0; month < months; month += 1) balance = balance * (1 + monthlyRate) + phase.monthlyDca;
    const phaseDca = months * phase.monthlyDca;
    phaseTotals.push(phaseDca);
    totalDca += phaseDca;
  }

  const totalInvested = principal + totalDca;
  const total = Math.round(balance);
  const dividends = Math.max(0, total - totalInvested);
  const base = total > 0 ? total : 1;
  return {
    totalInvested,
    totalDca,
    dividends,
    total,
    increasePct: totalInvested > 0 ? (dividends / totalInvested) * 100 : 0,
    shares: { principal: (principal / base) * 100, dca: (totalDca / base) * 100, dividends: (dividends / base) * 100 },
    phaseTotals,
    years: phases.reduce((sum, phase) => sum + phase.years, 0),
  };
}
