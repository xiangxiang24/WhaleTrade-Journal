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
