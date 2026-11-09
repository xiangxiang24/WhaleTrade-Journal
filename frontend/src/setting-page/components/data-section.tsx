import { useCallback, useEffect, useState } from 'react'
import { CircleAlert, DatabaseBackup, HardDriveDownload } from 'lucide-react'
import { useI18n } from '../../shared/i18n/use-i18n'
import type { BackupInfo } from '../../shared/types/whale-app'
import RestoreBackupModal from '../modals/restore-backup-modal'
import SectionCard from './section-card'

const OUTLINE_BUTTON =
  'inline-flex h-11 items-center rounded-pill border-2 border-blue-500 bg-surface px-6 text-[15px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50 max-[479px]:w-full max-[479px]:justify-center'

// Section Data & Backup: สำรองข้อมูลเอง / กู้คืนจากชุดสำรอง / บอกสถานะสำรองอัตโนมัติ (มีเฉพาะในแอปจริง)
export default function DataSection({ onDone }: { onDone: (message: string) => void }) {
  const { t, language } = useI18n()
  const app = window.whaleApp
  const [info, setInfo] = useState<BackupInfo>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const [picked, setPicked] = useState<string | null>(null)

  const refresh = useCallback(() => void app?.backup.info().then(setInfo), [app])
  useEffect(refresh, [refresh])

  if (!app) return null

  async function backUp() {
    setBusy(true)
    setError(undefined)
    try {
      const result = await app!.backup.create()
      if ('error' in result) setError(t('Could not back up your data. Please try again.'))
      else if ('path' in result) onDone(t('Backup saved'))
      refresh()
    } finally {
      setBusy(false)
    }
  }

  async function chooseRestore() {
    setBusy(true)
    setError(undefined)
    try {
      const result = await app!.backup.pickRestore()
      if ('error' in result) setError(t(result.error))
      else if ('createdAt' in result) setPicked(result.createdAt)
    } finally {
      setBusy(false)
    }
  }

  async function restore() {
    const result = await app!.backup.restore()
    if ('error' in result) throw new Error(result.error)
  }

  const last = info?.lastAuto
    ? new Date(`${info.lastAuto}T00:00:00`).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { dateStyle: 'medium' })
    : null

  return (
    <SectionCard id="data-title" title={t('Data & Backup')} description={t('Keep a copy of your journal somewhere safe.')}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-3xl bg-parchment px-4 py-4 min-[640px]:px-6">
        <div className="min-w-0 flex-1 basis-72">
          <p className="m-0 flex items-center gap-2 text-[18px] leading-6 font-bold text-navy-900">
            <HardDriveDownload size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-navy-700" />
            {t('Back up your data')}
          </p>
          <p className="m-0 mt-0.5 text-[13px] leading-5 text-text-muted">
            {t('Saves your notes, portfolios, plans and attachments into a folder you choose, such as an external drive or cloud folder.')}
          </p>
          <p className="m-0 mt-1 text-[13px] leading-5 text-text-muted">
            {last ? t('Automatic backup: last made on {date}').replace('{date}', last) : t('Automatic backup runs once a day when you open the app.')}
          </p>
        </div>
        <button type="button" onClick={backUp} disabled={busy} className={OUTLINE_BUTTON}>
          {t('Back up now')}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-3xl bg-parchment px-4 py-4 min-[640px]:px-6">
        <div className="min-w-0 flex-1 basis-72">
          <p className="m-0 flex items-center gap-2 text-[18px] leading-6 font-bold text-navy-900">
            <DatabaseBackup size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-navy-700" />
            {t('Restore from a backup')}
          </p>
          <p className="m-0 mt-0.5 text-[13px] leading-5 text-text-muted">
            {t('Replaces the data in this app with a backup folder you choose, for example after moving to a new Mac.')}
          </p>
        </div>
        <button type="button" onClick={chooseRestore} disabled={busy} className={OUTLINE_BUTTON}>
          {t('Choose backup…')}
        </button>
      </div>

      {error && (
        <p role="alert" className="m-0 mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
          <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
          {error}
        </p>
      )}

      <RestoreBackupModal createdAt={picked} onConfirm={restore} onClose={() => setPicked(null)} />
    </SectionCard>
  )
}
