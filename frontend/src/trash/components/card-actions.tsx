import { RotateCcw, Trash2 } from 'lucide-react'
import { useI18n } from '../../shared/i18n/use-i18n'

type CardActionsProps = {
  /** ชื่อรายการ ใช้ทำ aria-label ให้ปุ่มบอกได้ว่ากดกับรายการไหน */
  name: string
  onRestore: () => void
  onDelete: () => void
}

// ปุ่มท้ายการ์ดในถังขยะ: ลบถาวร (ขอบแดง) + กู้คืน (ปุ่มหลัก) ปุ่มไม่จางแม้การ์ดจาง
export default function CardActions({ name, onRestore, onDelete }: CardActionsProps) {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={onDelete}
        aria-label={t('Delete {name} forever', { name })}
        className="inline-flex h-10 items-center gap-1.5 rounded-pill border-2 border-red-500 bg-surface px-4 text-[14px] leading-5 font-semibold text-red-500 transition-colors duration-150 hover:bg-red-50 active:bg-red-50"
      >
        <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
        {t('Delete forever')}
      </button>
      <button
        type="button"
        onClick={onRestore}
        aria-label={t('Restore {name}', { name })}
        className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-blue-500 px-4 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900"
      >
        <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
        {t('Restore')}
      </button>
    </div>
  )
}
