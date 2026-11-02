import type { Asset } from '../../shared/types/transaction'

export type SourceMode = 'portfolio' | 'manual'

/** แถว asset ในขั้นตอนที่ 1: asset + ข้อความช่องปันผล % ต่อปี (เก็บเป็นข้อความเพื่อพิมพ์ได้อิสระ) */
export type AssetRow = {
  asset: Asset
  yieldText: string
}

/** แถวเฟสในขั้นตอนที่ 3 (เก็บเป็นข้อความเช่นกัน) */
export type PhaseRow = {
  id: number
  yearsText: string
  dcaText: string
}

export type { CalcInput, CalcOutput, PhaseInput } from '../../shared/types/calc-plan'
import type { CalcInput, CalcOutput } from '../../shared/types/calc-plan'

/** ผลลัพธ์ที่แสดง + ลายเซ็นของค่าในฟอร์มตอนกดคำนวณ (ไว้ตรวจว่าผลล้าสมัยหรือยัง) */
export type CalcResult = {
  output: CalcOutput
  input: CalcInput
  signature: string
  avgYieldPct: number
  /** แหล่งที่มา: พอร์ต (id) หรือกรอกเอง (null) ไว้ตอนบันทึกแผน */
  portfolioId: number | null
  /** asset ที่ใช้คำนวณ + ปันผล % ต่อปีของแต่ละตัว */
  assets: { assetId: number; ticker: string; dividendPct: number }[]
}

export const MAX_PHASES = 8
export const MAX_YEARS = 60
export const PHASE_STAGES = ['Foundation Stage', 'Expansion Stage', 'Acceleration Stage', 'Harvest Stage']
export const stageName = (index: number) => PHASE_STAGES[index] ?? 'Continued Stage'
