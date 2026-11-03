import { ArrowLeft } from 'lucide-react'
import { useI18n } from '../../shared/i18n/use-i18n'

// ปุ่มแคปซูลสีขาวมีเงา "Back to Journals" ใต้ TopBar
export default function BackButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-line bg-surface px-4 text-[14px] leading-5 font-medium text-navy-700 shadow-md transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100"
    >
      <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
      {t('Back to Journals')}
    </button>
  )
}
