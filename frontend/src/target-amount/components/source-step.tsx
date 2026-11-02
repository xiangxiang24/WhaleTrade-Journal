import { ChevronDown, CircleAlert, PenLine, WalletCards } from 'lucide-react'
import type { SourceMode } from '../types/target-amount'
import type { Calculator } from '../types/use-calculator'
import AddAssetControl from './add-asset-control'
import AssetYieldRow from './asset-yield-row'
import StepCard from './step-card'

const TABS: { value: SourceMode; label: string; Icon: typeof WalletCards }[] = [
  { value: 'portfolio', label: 'Use a portfolio', Icon: WalletCards },
  { value: 'manual', label: 'Enter manually', Icon: PenLine },
]

const PRIMARY_BUTTON =
  'inline-flex h-10 items-center rounded-pill bg-blue-500 px-5 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900'

// ขั้นตอนที่ 1: เลือกแหล่งหุ้น/กองทุน 2 โหมด (ดึงจากพอร์ต / กรอกเอง) + ตารางปันผล % ต่อปีของแต่ละตัว
export default function SourceStep({ calc }: { calc: Calculator }) {
  const { mode, options, sourceStatus, portfolioId, rows, errors } = calc
  const selected = options.find((option) => option.portfolio.id === portfolioId)

  return (
    <StepCard
      step={1}
      title="Where should we start?"
      description="Select an existing dividend portfolio or choose individual stocks manually."
    >
      <div role="tablist" aria-label="Source of stocks" className="inline-flex max-w-full gap-1 rounded-pill bg-blue-50 p-1 max-[479px]:flex">
        {TABS.map(({ value, label, Icon }) => {
          const active = mode === value
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => calc.setMode(value)}
              className={`inline-flex h-9 items-center justify-center gap-2 rounded-pill px-4 text-[13px] leading-5 font-semibold whitespace-nowrap transition-colors duration-150 max-[479px]:flex-1 max-[479px]:px-2 ${
                active ? 'bg-blue-500 text-surface' : 'text-navy-700 hover:bg-blue-100'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>

      {mode === 'portfolio' && (
        <div className="mt-4">
          {sourceStatus === 'loading' && (
            <div role="status" aria-label="Loading your portfolios" className="h-11 animate-pulse rounded-pill bg-blue-100 motion-reduce:animate-none" />
          )}
          {sourceStatus === 'error' && (
            <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-blue-50 px-4 py-3 text-[14px] leading-5 text-navy-700">
              Could not load your portfolios.
              <button type="button" onClick={calc.reloadSource} className={PRIMARY_BUTTON}>
                Try again
              </button>
            </div>
          )}
          {sourceStatus === 'ready' && options.length === 0 && (
            <p className="m-0 rounded-3xl bg-blue-50 px-4 py-3 text-[14px] leading-6 text-navy-700">
              You have no portfolios yet. Switch to <strong>Enter manually</strong> or create a portfolio first.
            </p>
          )}
          {sourceStatus === 'ready' && options.length > 0 && (
            <>
              <label htmlFor="calc-portfolio" className="block text-[12px] leading-4 font-semibold text-navy-900">
                Choose a portfolio
              </label>
              <div className="relative mt-1.5">
                <select
                  id="calc-portfolio"
                  value={portfolioId ?? ''}
                  onChange={(event) => calc.selectPortfolio(Number(event.target.value))}
                  className="h-11 w-full appearance-none rounded-pill border-2 border-blue-500 bg-surface pr-11 pl-4 text-[14px] font-semibold text-navy-900 outline-none transition-shadow duration-150 focus:shadow-focus"
                >
                  {portfolioId === null && <option value="">Select a portfolio</option>}
                  {options.map(({ portfolio, holdings }) => (
                    <option key={portfolio.id} value={portfolio.id}>
                      {portfolio.name} ({holdings.length} Active {holdings.length === 1 ? 'Asset' : 'Assets'})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-blue-500"
                />
              </div>
              {selected && selected.holdings.length === 0 && (
                <p className="m-0 mt-2 text-[13px] leading-5 text-text-muted">
                  This portfolio has no holdings yet. Record a Buy first, or add stocks below.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-5">
          <div className="flex justify-between gap-3 px-4 pb-2 text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase max-[479px]:hidden">
            <span>Holding name &amp; market</span>
            <span>Dividend yield % per year</span>
          </div>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {rows.map((row) => (
              <AssetYieldRow
                key={row.asset.id}
                row={row}
                onYieldChange={(text) => calc.setAssetYield(row.asset.id, text)}
                onRemove={() => calc.removeAsset(row.asset.id)}
              />
            ))}
          </ul>
        </div>
      )}

      {rows.length === 0 && (mode === 'manual' || (sourceStatus === 'ready' && options.length > 0)) && (
        <p className="m-0 mt-4 text-[13px] leading-5 text-text-muted">
          {mode === 'manual'
            ? 'Search for a stock or fund below, then enter its expected yearly dividend.'
            : 'Add the stocks you want to include, then enter their expected yearly dividend.'}
        </p>
      )}

      {errors.assets && (
        <p role="alert" className="m-0 mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
          <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
          {errors.assets}
        </p>
      )}

      {/* key = โหมด: สลับโหมดแล้วช่องค้นหาเริ่มใหม่ ไม่ค้างค่าจากอีกโหมด */}
      <div className="mt-3">
        <AddAssetControl key={mode} alwaysOpen={mode === 'manual'} onAdd={calc.addAsset} />
      </div>
    </StepCard>
  )
}
