import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { holdings, type Holding } from '../../shared/data/portfolio-math'
import { fetchPortfolios } from '../../shared/data/portfolios'
import { fetchTransactions } from '../../shared/data/transactions'
import type { Portfolio } from '../../shared/types/portfolio'
import type { Asset } from '../../shared/types/transaction'
import { calculatePlan } from '../../shared/data/calculate-plan'
import {
  MAX_PHASES,
  MAX_YEARS,
  type AssetRow,
  type CalcResult,
  type PhaseInput,
  type PhaseRow,
  type SourceMode,
} from './target-amount'
import { useI18n } from '../../shared/i18n/use-i18n'

export type PortfolioOption = { portfolio: Portfolio; holdings: Holding[] }
export type SourceStatus = 'loading' | 'ready' | 'error'
export type FormErrors = { assets?: string; principal?: string; dca?: string; duration?: string; phases?: string }

const digitsOf = (text: string) => text.replace(/\D/g, '')

/** "100,000" → 100000, ว่าง → null */
export function parseWhole(text: string) {
  const digits = digitsOf(text)
  return digits === '' ? null : Number(digits)
}

/** "7.1" → 7.1 (0 < ค่า ≤ 100) ไม่ผ่าน → null */
export function parseYield(text: string) {
  const value = Number(text)
  return text.trim() !== '' && Number.isFinite(value) && value > 0 && value <= 100 ? value : null
}

const yieldText = (value: number | null) => (value === null ? '' : String(Number(value.toFixed(1))))

// state ทั้งหมดของฟอร์มเครื่องคำนวณ + ตัวเลขสรุปสดๆ + การคำนวณ (ผลจำลอง) และตรวจข้อมูลตอนกด Calculate
export function useCalculator() {
  const { t } = useI18n()
  const [mode, setMode] = useState<SourceMode>('portfolio')
  const [options, setOptions] = useState<PortfolioOption[]>([])
  const [sourceStatus, setSourceStatus] = useState<SourceStatus>('loading')
  const [attempt, setAttempt] = useState(0)
  const [portfolioId, setPortfolioId] = useState<number | null>(null)
  const [portfolioRows, setPortfolioRows] = useState<AssetRow[]>([])
  const [manualRows, setManualRows] = useState<AssetRow[]>([])

  const [principalText, setPrincipalText] = useState('100,000')
  const [dcaText, setDcaText] = useState('5,000')
  const [yearsText, setYearsText] = useState('10')
  const [phasesOn, setPhasesOn] = useState(false)
  const [phases, setPhases] = useState<PhaseRow[]>([])
  const phaseId = useRef(1)

  const [result, setResult] = useState<CalcResult | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  // โหลดพอร์ตทั้งหมด + Holdings ของแต่ละพอร์ต (ไว้แสดง "N Active Assets" และดึงรายการหุ้นเมื่อเลือก)
  useEffect(() => {
    let cancelled = false
    fetchPortfolios()
      .then((portfolios) =>
        Promise.all(
          portfolios.map(async (portfolio) => ({ portfolio, holdings: holdings(await fetchTransactions(portfolio.id)) })),
        ),
      )
      .then((loaded) => {
        if (cancelled) return
        setOptions(loaded)
        setSourceStatus('ready')
        // เลือกพอร์ตแรกที่มีหุ้นให้เลย (ดึงรายการหุ้นมาใส่ตารางอัตโนมัติ)
        const first = loaded.find((option) => option.holdings.length > 0)
        if (first) {
          setPortfolioId(first.portfolio.id)
          setPortfolioRows(rowsFromHoldings(first.holdings))
        }
      })
      .catch(() => {
        if (!cancelled) setSourceStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const reloadSource = useCallback(() => {
    setSourceStatus('loading')
    setAttempt((current) => current + 1)
  }, [])

  function rowsFromHoldings(held: Holding[]): AssetRow[] {
    // ปันผลเริ่มต้น = Yield on cost ของหุ้นนั้นในพอร์ต (แก้ได้) ไม่มีข้อมูล = เว้นว่างให้ผู้ใช้กรอก
    return held.map((item) => ({ asset: item.asset, yieldText: yieldText(item.yieldPct) }))
  }

  function selectPortfolio(id: number) {
    const option = options.find((item) => item.portfolio.id === id)
    setPortfolioId(id)
    setPortfolioRows(option ? rowsFromHoldings(option.holdings) : [])
    setErrors((current) => ({ ...current, assets: undefined }))
  }

  const rows = mode === 'portfolio' ? portfolioRows : manualRows
  const setRows = mode === 'portfolio' ? setPortfolioRows : setManualRows

  /** เพิ่ม asset เข้ารายการของโหมดปัจจุบัน (ซ้ำ = false) */
  function addAsset(asset: Asset) {
    if (rows.some((row) => row.asset.id === asset.id)) return false
    setRows([...rows, { asset, yieldText: '' }])
    setErrors((current) => ({ ...current, assets: undefined }))
    return true
  }

  const removeAsset = (assetId: number) => setRows(rows.filter((row) => row.asset.id !== assetId))
  const setAssetYield = (assetId: number, text: string) =>
    setRows(rows.map((row) => (row.asset.id === assetId ? { ...row, yieldText: text } : row)))

  function togglePhases(on: boolean) {
    setPhasesOn(on)
    // เปิดครั้งแรก = เริ่มจาก 1 เฟสที่ยกค่า Duration / Monthly DCA จากขั้นตอนที่ 2 มา
    if (on && phases.length === 0) {
      setPhases([{ id: phaseId.current++, yearsText: yearsText || '1', dcaText }])
    }
  }

  const addPhase = () => {
    if (phases.length >= MAX_PHASES) return
    const last = phases[phases.length - 1]
    setPhases([...phases, { id: phaseId.current++, yearsText: '1', dcaText: last?.dcaText ?? '' }])
  }
  const removePhase = (id: number) => setPhases(phases.filter((phase) => phase.id !== id))
  const updatePhase = (id: number, patch: Partial<PhaseRow>) =>
    setPhases(phases.map((phase) => (phase.id === id ? { ...phase, ...patch } : phase)))

  // ตัวเลขที่ใช้คำนวณ: ปิดเฟส = 1 เฟสจาก Duration + Monthly DCA
  const principal = parseWhole(principalText) ?? 0
  const phaseInputs: PhaseInput[] = useMemo(() => {
    if (!phasesOn) return [{ years: parseWhole(yearsText) ?? 0, monthlyDca: parseWhole(dcaText) ?? 0 }]
    return phases.map((phase) => ({ years: parseWhole(phase.yearsText) ?? 0, monthlyDca: parseWhole(phase.dcaText) ?? 0 }))
  }, [phasesOn, phases, yearsText, dcaText])

  const totalYears = phaseInputs.reduce((sum, phase) => sum + phase.years, 0)
  const phaseDca = phaseInputs.map((phase) => phase.years * 12 * phase.monthlyDca)
  const totalDca = phaseDca.reduce((sum, value) => sum + value, 0)
  const yields = rows.map((row) => parseYield(row.yieldText)).filter((value): value is number => value !== null)
  const avgYield = yields.length > 0 ? yields.reduce((sum, value) => sum + value, 0) / yields.length : null

  const summary = { principal, phaseDca, totalDca, totalYears, avgYield, totalInvested: principal + totalDca }

  // ลายเซ็นของค่าในฟอร์ม: ต่างจากตอนคำนวณล่าสุด = ผลล้าสมัย (ปุ่มเป็น Recalculate)
  const signature = JSON.stringify([
    mode === 'portfolio' ? portfolioId : null,
    rows.map((row) => [row.asset.id, row.yieldText]),
    principal,
    phaseInputs,
  ])
  const stale = result !== null && result.signature !== signature

  function validate(): FormErrors {
    const found: FormErrors = {}
    if (rows.length === 0) found.assets = t('Add at least one stock or fund to calculate.')
    else if (rows.some((row) => parseYield(row.yieldText) === null))
      found.assets = t('Enter a dividend yield between 0 and 100% for every stock or fund.')
    if (principalText.trim() === '' && phaseDca.every((value) => value === 0) && totalDca === 0)
      found.principal = t('Enter your initial principal or a monthly DCA.')
    if (!phasesOn) {
      if (parseWhole(dcaText) === null) found.dca = t('Enter a monthly DCA (0 if none).')
      const years = parseWhole(yearsText)
      if (years === null || years < 1 || years > MAX_YEARS) found.duration = t('Enter a duration from 1 to {max} years.', { max: MAX_YEARS })
    } else if (phases.some((phase) => !(parseWhole(phase.yearsText) ?? 0) || parseWhole(phase.dcaText) === null)) {
      found.phases = t('Every phase needs at least 1 year and a monthly DCA (0 if none).')
    } else if (totalYears > MAX_YEARS) {
      found.phases = t('Total duration can be at most {max} years.', { max: MAX_YEARS })
    }
    if (!found.principal && principal === 0 && totalDca === 0) found.principal = t('Enter your initial principal or a monthly DCA.')
    return found
  }

  /** กด Calculate / Recalculate: ตรวจข้อมูลแล้วคำนวณ (สำเร็จ = true) */
  function calculate() {
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0 || avgYield === null) return false
    const input = { principal, phases: phaseInputs, avgYieldPct: avgYield }
    setResult({
      output: calculatePlan(input),
      input,
      signature,
      avgYieldPct: avgYield,
      portfolioId: mode === 'portfolio' ? portfolioId : null,
      assets: rows.map((row) => ({ assetId: row.asset.id, ticker: row.asset.ticker, dividendPct: parseYield(row.yieldText) ?? 0 })),
    })
    return true
  }

  return {
    mode,
    setMode,
    options,
    sourceStatus,
    reloadSource,
    portfolioId,
    selectPortfolio,
    rows,
    addAsset,
    removeAsset,
    setAssetYield,
    principalText,
    setPrincipalText,
    dcaText,
    setDcaText,
    yearsText,
    setYearsText,
    phasesOn,
    togglePhases,
    phases,
    addPhase,
    removePhase,
    updatePhase,
    summary,
    result,
    stale,
    errors,
    calculate,
  }
}

export type Calculator = ReturnType<typeof useCalculator>
