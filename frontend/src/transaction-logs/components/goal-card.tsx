import { CircleCheck, Sparkles, SquarePen, Sprout } from 'lucide-react'
import { nextMilestone } from '../../shared/data/portfolio-math'
import { formatBaht } from '../types/format'
import { useI18n } from '../../shared/i18n/use-i18n'

type GoalCardProps = {
  goal: number | null
  /** Current Yield Run-Rate (ปันผล 12 เดือนล่าสุด) */
  rate: number
  onEditGoal: () => void
}

const OVERLINE = 'text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase'
const NOTE =
  'Calculated from recorded transactions & recorded dividends, not market price fluctuations. Your steady cashflow grows undisturbed.'

// การ์ด Annual Dividend Goal: เป้า / % / แถบ (มีขีด 25-50-75%) / Run-Rate vs Target / Next milestone
export default function GoalCard({ goal, rate, onEditGoal }: GoalCardProps) {
  const { t } = useI18n()
  const ratio = goal ? rate / goal : 0
  const percent = Math.min(100, ratio * 100)
  const reached = goal !== null && rate >= goal
  const milestone = nextMilestone(rate, goal)

  return (
    <section
      aria-label={t('Annual dividend goal')}
      className="flex flex-col rounded-4xl bg-surface p-5 shadow-md min-[640px]:p-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`m-0 flex items-center gap-2 ${OVERLINE}`}>
          <Sprout size={16} strokeWidth={1.75} aria-hidden="true" className="text-navy-700" />
          {t('Annual dividend goal')}
        </h2>
        <button
          type="button"
          onClick={onEditGoal}
          className="inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-[13px] leading-5 font-semibold text-navy-700 hover:bg-blue-50 active:bg-blue-100"
        >
          <SquarePen size={16} strokeWidth={1.75} aria-hidden="true" />
          {goal ? t('Edit goal') : t('Set goal')}
        </button>
      </header>

      {goal ? (
        <>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="m-0 text-[30px] leading-9 font-bold whitespace-nowrap text-navy-900 tabular-nums min-[640px]:text-[36px] min-[640px]:leading-11">
              {formatBaht(goal)}
              <span className="ml-2 text-[0.5em] font-semibold text-text-muted">{t('THB / year')}</span>
            </p>
            {reached ? (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-green-50 px-3 py-0.5 text-[13px] leading-5 font-semibold text-navy-900">
                <CircleCheck size={16} strokeWidth={1.75} aria-hidden="true" className="text-green-500" />
                {t('Goal reached')}
              </span>
            ) : (
              <span className="text-[14px] leading-5 font-semibold text-navy-700 tabular-nums">
                {t('{percent}% reached', { percent: percent.toFixed(1) })}
              </span>
            )}
          </div>

          <div
            role="progressbar"
            aria-label={t('Goal progress')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            className="relative mt-4 h-2 overflow-hidden rounded-pill bg-blue-100"
          >
            <div
              className={`h-full rounded-pill transition-[width] duration-500 ease-soft motion-reduce:transition-none ${reached ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${percent}%` }}
            />
            {[25, 50, 75].map((step) => (
              <span
                key={step}
                aria-hidden="true"
                className="absolute inset-y-0 w-0.5 bg-surface"
                style={{ left: `${step}%` }}
              />
            ))}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[13px] leading-5 text-navy-900">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="size-2 rounded-pill bg-navy-700" />
              <span className="tabular-nums">{t('Current Yield Run-Rate:')} <strong>{formatBaht(rate)} {t('THB')}</strong></span>
            </span>
            <span className="tabular-nums text-text-muted">{t('Target: {amount} THB', { amount: formatBaht(goal) })}</span>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-3xl bg-blue-50 px-5 py-5">
          <p className="m-0 text-[18px] leading-7 font-bold text-navy-900">{t('No goal yet')}</p>
          <p className="m-0 mt-1 text-[14px] leading-6 text-navy-700">
            {t('Set a yearly dividend goal to see how your recorded dividends grow toward it. Current run-rate:')}{' '}
            <strong className="tabular-nums">{formatBaht(rate)} {t('THB')}</strong>
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <p className="m-0 max-w-90 flex-1 basis-56 text-[12px] leading-5 text-text-muted">{t(NOTE)}</p>
        {milestone && (
          <p className="m-0 inline-flex items-center gap-2 rounded-pill bg-blue-50 px-4 py-2 text-[13px] leading-5 font-medium text-navy-900">
            <Sparkles size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-navy-700" />
            <span className="tabular-nums">
              {t('Next milestone: {target} THB ({remaining} to go)', { target: formatBaht(milestone.target), remaining: formatBaht(milestone.remaining) })}
            </span>
          </p>
        )}
      </div>
    </section>
  )
}
