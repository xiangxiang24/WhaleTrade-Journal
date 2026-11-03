import { KeyRound, TriangleAlert } from 'lucide-react'
import SectionCard from './section-card'

// ข้อความคำเตือนคงที่ของโซนอันตราย (setting-page.md)
const DANGER_TEXT =
  'This permanently removes your dividend journal entries, yield records, buy theses, and calculations. This cannot be undone.'

// Section 3 Account Security: เปลี่ยนรหัสผ่าน + Danger zone ลบบัญชี (พื้น red-50)
export default function SecuritySection({ onChangePassword, onDelete }: { onChangePassword: () => void; onDelete: () => void }) {
  return (
    <SectionCard id="security-title" title="Account Security" description="Keep your journal safe, private, and anchored.">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-3xl bg-parchment px-4 py-4 min-[640px]:px-6">
        <div className="min-w-0">
          <p className="m-0 flex items-center gap-2 text-[18px] leading-6 font-bold text-navy-900">
            <KeyRound size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-navy-700" />
            Change password
          </p>
          <p className="m-0 mt-0.5 text-[13px] leading-5 text-text-muted">Update the password you use to unlock your journal.</p>
        </div>
        <button
          type="button"
          onClick={onChangePassword}
          className="inline-flex h-11 items-center rounded-pill border-2 border-blue-500 bg-surface px-6 text-[15px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100 max-[479px]:w-full max-[479px]:justify-center"
        >
          Change password
        </button>
      </div>

      <div className="mt-4 rounded-3xl bg-red-50 p-4 min-[640px]:p-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 flex-1 basis-80 items-start gap-4">
            <span
              aria-hidden="true"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-surface"
            >
              <TriangleAlert size={22} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="m-0 text-[11px] leading-4 font-semibold tracking-[0.08em] text-navy-900 uppercase">Danger zone</p>
              <h3 className="m-0 text-[20px] leading-7 font-bold text-navy-900">Delete account</h3>
              <p className="m-0 mt-2 text-[13px] leading-5 text-navy-900">{DANGER_TEXT}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-11 items-center rounded-pill border-2 border-red-500 bg-surface px-6 text-[15px] leading-5 font-semibold text-red-500 transition-colors duration-150 hover:bg-red-500 hover:text-surface active:brightness-95 max-[479px]:w-full max-[479px]:justify-center"
          >
            Delete account
          </button>
        </div>
      </div>
    </SectionCard>
  )
}
