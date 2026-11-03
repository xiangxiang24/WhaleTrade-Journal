import { useId, useState } from 'react'
import { CircleAlert, LogOut, Pencil } from 'lucide-react'
import type { AccountState } from '../types/use-account'
import { DISPLAY_NAME_MAX } from '../types/setting'
import AvatarEditor from './avatar-editor'
import SectionCard from './section-card'
import { useI18n } from '../../shared/i18n/use-i18n'

type AccountSectionProps = {
  state: AccountState
  onEditEmail: () => void
  onLogout: () => void
  /** แจ้งผลหลังบันทึกสำเร็จ */
  onSaved: () => void
}

// Section 1 Account: รูป + ชื่อเต็ม, ชื่อที่แสดง (แก้ได้), อีเมล (แสดงอย่างเดียว แก้ผ่านปุ่มดินสอ + รหัสผ่าน), Save Changes / Cancel / Log out
export default function AccountSection({ state, onEditEmail, onLogout, onSaved }: AccountSectionProps) {
  const { t } = useI18n()
  const { account, displayName, avatarUrl, profileDirty } = state
  const nameId = useId()
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string>()

  if (!account) return null

  async function handleSave() {
    const value = displayName.trim()
    if (!value) return setError(t('Please enter a display name.'))
    if (value.length > DISPLAY_NAME_MAX) return setError(t('Keep the name within {n} characters.', { n: DISPLAY_NAME_MAX }))
    setError(undefined)
    setSaveError(undefined)
    setSaving(true)
    try {
      await state.saveProfile()
      onSaved()
    } catch (caught) {
      setSaveError(t(caught instanceof Error ? caught.message : 'Could not save your changes. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard id="account-title" title={t('Account')} description={t('How you appear in your dividend journal.')}>
      <div className="rounded-3xl bg-blue-50 p-4 min-[640px]:p-6">
        <AvatarEditor
          displayName={displayName || account.displayName}
          avatarUrl={avatarUrl}
          onChange={state.setAvatarUrl}
          title={
            <p className="m-0 text-[22px] leading-8 font-bold break-words text-navy-900 min-[640px]:text-[26px] min-[640px]:leading-9">
              {account.fullName}
            </p>
          }
        />
      </div>

      <div className="mt-5 grid gap-4 min-[768px]:grid-cols-2 min-[768px]:gap-6">
        <div className="min-w-0">
          <label htmlFor={nameId} className="block text-[14px] leading-5 font-semibold text-navy-900">
            {t('Display name')}
          </label>
          <input
            id={nameId}
            value={displayName}
            maxLength={DISPLAY_NAME_MAX + 10}
            onChange={(event) => state.setDisplayName(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${nameId}-error` : undefined}
            className={`mt-1.5 h-11 w-full rounded-pill border-2 bg-surface px-4 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus ${
              error ? 'border-red-500' : 'border-blue-500'
            }`}
          />
          {error && (
            <p id={`${nameId}-error`} className="m-0 mt-1.5 flex items-start gap-1.5 text-[12px] leading-4 text-navy-900">
              <CircleAlert size={14} strokeWidth={1.75} className="mt-px shrink-0 text-red-500" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <span className="block text-[14px] leading-5 font-semibold text-navy-900">{t('Email')}</span>
          <div className="mt-1.5 flex h-11 items-center gap-2 rounded-pill bg-blue-50 pr-1.5 pl-4">
            <span className="min-w-0 flex-1 truncate text-[14px] text-navy-700">{account.email}</span>
            <button
              type="button"
              onClick={onEditEmail}
              aria-label={t('Change email')}
              className="group/icon inline-flex size-9 shrink-0 items-center justify-center rounded-pill text-navy-700 hover:text-blue-500"
            >
              <Pencil size={16} strokeWidth={1.75} aria-hidden="true" className="transition-[stroke-width] duration-150 group-hover/icon:stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {saveError && (
        <p role="alert" className="m-0 mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
          <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
          {saveError}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!profileDirty || saving}
          className="inline-flex h-11 items-center rounded-pill bg-blue-500 px-7 text-[15px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:shadow-none"
        >
          {saving ? t('Saving…') : t('Save Changes')}
        </button>
        <button
          type="button"
          onClick={() => {
            setError(undefined)
            state.cancelProfile()
          }}
          disabled={!profileDirty || saving}
          className="inline-flex h-11 items-center rounded-pill border-2 border-blue-200 bg-surface px-6 text-[15px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-60"
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="group/icon ml-auto inline-flex h-11 items-center gap-2 rounded-pill px-4 text-[15px] leading-5 font-semibold text-red-500 hover:brightness-75 max-[479px]:w-full max-[479px]:justify-center"
        >
          <LogOut size={20} strokeWidth={1.75} aria-hidden="true" className="transition-[stroke-width] duration-150 group-hover/icon:stroke-[2.5]" />
          {t('Log out')}
        </button>
      </div>
    </SectionCard>
  )
}
