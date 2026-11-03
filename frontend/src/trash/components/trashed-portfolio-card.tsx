import { CalendarDays, FileText, Trash2 } from 'lucide-react'
import PortfolioIcon from '../../portfolio/components/portfolio-icon'
import { formatUpdated } from '../../portfolio/types/format'
import type { TrashedPortfolio } from '../../shared/types/portfolio'
import { useI18n } from '../../shared/i18n/use-i18n'
import CardActions from './card-actions'

type TrashedPortfolioCardProps = {
  portfolio: TrashedPortfolio
  timeZone: string
  onRestore: (portfolio: TrashedPortfolio) => void
  onDelete: (portfolio: TrashedPortfolio) => void
}

// การ์ดพอร์ตในถังขยะ: จางและกดเข้าหน้าพอร์ตไม่ได้ มีแค่กู้คืน / ลบถาวร
export default function TrashedPortfolioCard({ portfolio, timeZone, onRestore, onDelete }: TrashedPortfolioCardProps) {
  const { t, locale } = useI18n()

  return (
    <article
      aria-label={portfolio.name}
      className="flex h-full flex-col rounded-3xl border-2 border-dashed border-blue-200 bg-surface p-5 shadow-sm"
    >
      <div className="mb-4 opacity-70">
        <header className="flex items-center gap-3">
          <PortfolioIcon icon={portfolio.icon} className="size-11" />
          <div className="min-w-0 flex-1">
            <h2 className="m-0 line-clamp-2 text-[18px] leading-6 font-bold break-words text-navy-900">{portfolio.name}</h2>
            {portfolio.tagline && <p className="m-0 truncate text-[13px] leading-5 text-text-muted">{portfolio.tagline}</p>}
          </div>
        </header>
        <p className="m-0 mt-3 line-clamp-3 text-[14px] leading-6 text-navy-700">
          {portfolio.description ?? t('No description')}
        </p>
      </div>

      <dl className="m-0 mt-auto flex flex-col gap-1 border-t border-line pt-3 text-[12px] leading-4 text-text-muted">
        <div className="mt-0 flex items-center gap-1.5">
          <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <dt>{t('Deleted')}</dt>
          <dd className="m-0">
            <time dateTime={portfolio.deletedAt}>{formatUpdated(portfolio.deletedAt, timeZone, locale)}</time>
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <dt>{t('Transactions')}</dt>
          <dd className="m-0">{portfolio.entries}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <dt>{t('Saved plans')}</dt>
          <dd className="m-0">{portfolio.planCount}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <CardActions
          name={portfolio.name}
          onRestore={() => onRestore(portfolio)}
          onDelete={() => onDelete(portfolio)}
        />
      </div>
    </article>
  )
}
