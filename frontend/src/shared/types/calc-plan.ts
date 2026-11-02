/** ช่วง (phase) ของแผน: ระยะเวลาเป็นปี + DCA ต่อเดือน (บาท) */
export type PlanPhase = {
  years: number
  monthlyDca: number
}

/** asset ในแผน + ปันผล % ต่อปีที่ผู้ใช้ระบุ */
export type PlanAsset = {
  assetId: number
  dividendPct: number
}

/** แผนเครื่องคำนวณที่บันทึก (ตาราง CalcPlan + PlanPhase + PlanAsset) */
export type CalcPlan = {
  id: number
  /** มีค่า = สร้างจากพอร์ต, ว่าง = กรอกเอง ("Manual Portfolio") */
  portfolioId: number | null
  name: string
  principal: number
  /** ผลที่แสดงบนการ์ดแผน (โชว์อย่างเดียว เปิดแผนแล้วคำนวณใหม่) */
  resultAmount: number
  savedAt: string
  phases: PlanPhase[]
  assets: PlanAsset[]
}

/** ช่วงที่ส่งเข้าตัวคำนวณ */
export type PhaseInput = { years: number; monthlyDca: number }

export type CalcInput = {
  principal: number
  phases: PhaseInput[]
  /** ปันผลเฉลี่ยต่อปี (เปอร์เซ็นต์) */
  avgYieldPct: number
}

export type CalcOutput = {
  totalInvested: number
  totalDca: number
  /** ปันผลทบต้นที่คาดว่าจะได้รับ */
  dividends: number
  total: number
  /** เพิ่มขึ้นเทียบกับเงินที่ลงทุนไป (เปอร์เซ็นต์) */
  increasePct: number
  /** สัดส่วนของยอดรวมปลายทาง (เปอร์เซ็นต์ ผลรวม 100) */
  shares: { principal: number; dca: number; dividends: number }
  /** DCA สะสมของแต่ละเฟส */
  phaseTotals: number[]
  years: number
}

