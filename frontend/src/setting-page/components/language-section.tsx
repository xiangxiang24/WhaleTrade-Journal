import { useState } from 'react'
import { ChevronDown, CircleAlert } from 'lucide-react'
import type { Language } from '../../shared/types/account'
import type { AccountState } from '../types/use-account'
import { REGIONS, flagOf, regionLabel } from '../types/setting'
import SectionCard from './section-card'

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'th', label: 'ไทย' },
  { value: 'en', label: 'English' },
]

// Section 2 Language & Display: สวิตช์ภาษา ไทย / English + เลือกประเทศ/เขตเวลา + Save preferences
export default function LanguageSection({ state, onSaved }: { state: AccountState; onSaved: () => void }) {
  const { language, timezone, prefsDirty } = state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()

  // เขตเวลาเดิมที่ไม่อยู่ในรายการ (เช่นตั้งไว้จากที่อื่น) ยังต้องแสดงได้ จึงเพิ่มเป็นตัวเลือกพิเศษ
  const known = REGIONS.some((region) => region.timezone === timezone)

  async function handleSave() {
    setError(undefined)
    setSaving(true)
    try {
      await state.savePreferences()
      onSaved()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard id="language-title" title="Language & Display" description="Choose how the app speaks and shows things to you.">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-3xl bg-parchment px-4 py-4 min-[640px]:px-6">
        <div className="min-w-0">
          <p className="m-0 text-[18px] leading-6 font-bold text-navy-900">Interface Language</p>
          <p className="m-0 text-[13px] leading-5 text-text-muted">Language used for mindfulness prompts &amp; reports.</p>
        </div>
        <div role="radiogroup" aria-label="Interface language" className="inline-flex gap-1 rounded-pill bg-surface p-1 max-[479px]:w-full">
          {LANGUAGES.map((item) => {
            const selected = item.value === language
            return (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={selected}
                lang={item.value}
                onClick={() => state.setLanguage(item.value)}
                data-no-bounce
                className={`inline-flex h-9 min-w-20 items-center justify-center rounded-pill px-4 text-[14px] leading-5 font-semibold transition-colors duration-150 max-[479px]:flex-1 ${
                  selected ? 'bg-blue-500 text-surface' : 'text-navy-700 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="setting-timezone" className="block text-[18px] leading-6 font-bold text-navy-900">
          Time Zone &amp; Region
        </label>
        <div className="relative mt-2">
          <select
            id="setting-timezone"
            value={timezone}
            onChange={(event) => state.setTimezone(event.target.value)}
            className="h-11 w-full appearance-none rounded-pill border-2 border-blue-500 bg-surface pr-11 pl-4 text-[15px] text-navy-900 outline-none transition-shadow duration-150 focus:shadow-focus"
          >
            {!known && <option value={timezone}>{timezone}</option>}
            {REGIONS.map((region) => (
              <option key={region.timezone} value={region.timezone}>
                {flagOf(region.code)} {regionLabel(region)}
              </option>
            ))}
          </select>
          <ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-blue-500" />
        </div>
        <p className="m-0 mt-2 text-[13px] leading-5 text-text-muted">Used for scheduling gentle ex-dividend reflection reminders.</p>
      </div>

      {error && (
        <p role="alert" className="m-0 mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
          <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end max-[479px]:justify-stretch">
        <button
          type="button"
          onClick={handleSave}
          disabled={!prefsDirty || saving}
          className="inline-flex h-11 items-center justify-center rounded-pill bg-blue-500 px-7 text-[15px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:shadow-none max-[479px]:w-full"
        >
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
      </div>
    </SectionCard>
  )
}
