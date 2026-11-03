import { Info } from 'lucide-react'
import { useI18n } from '../../shared/i18n/use-i18n'

// กล่องข้อความอธิบายพฤติกรรมของถังขยะ
export default function TrashNotice() {
  const { t } = useI18n()
  return (
    <div role="note" className="flex items-start gap-3 rounded-3xl bg-blue-50 px-4 py-3.5 min-[640px]:px-5">
      <Info size={18} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-blue-500" />
      <p className="m-0 text-[14px] leading-6 text-navy-700">
        {t('Items in the trash do not appear anywhere else in the app. You can restore them at any time. Deleting for good cannot be undone, and nothing is deleted automatically.')}
      </p>
    </div>
  )
}
