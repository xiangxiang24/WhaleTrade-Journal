import { useRef, useState, type ReactNode } from 'react'
import { Camera, CircleAlert, Upload } from 'lucide-react'
import { AVATAR_MAX_BYTES, initialsOf } from '../types/setting'
import { useI18n } from '../../shared/i18n/use-i18n'

type AvatarEditorProps = {
  /** ชื่อที่แสดง (ใช้ทำตัวอักษรย่อเมื่อไม่มีรูป) */
  displayName: string
  avatarUrl: string | null
  onChange: (url: string | null) => void
  /** ชื่อเต็มที่แสดงเหนือปุ่ม Upload / Remove */
  title: ReactNode
}

// รูปโปรไฟล์ใหญ่ + ปุ่ม Upload new avatar / Remove: ไม่มีรูป = ตัวอักษรย่อ (เช่น TW) รูปที่เลือกเป็นร่างจนกว่าจะกด Save Changes
export default function AvatarEditor({ displayName, avatarUrl, onChange, title }: AvatarEditorProps) {
  const { t } = useI18n()
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()

  function handleFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) return setError(t('Please choose an image file.'))
    if (file.size > AVATAR_MAX_BYTES) return setError(t('Please choose an image under 2 MB.'))
    setError(undefined)
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.onerror = () => setError(t('Could not read this image. Please try another one.'))
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <div className="relative shrink-0">
        <span
          role="img"
          aria-label={avatarUrl ? t('Your profile photo') : t('Initials {initials}', { initials: initialsOf(displayName) })}
          className="flex size-[72px] items-center justify-center overflow-hidden rounded-pill bg-blue-500 text-[26px] leading-8 font-bold text-surface min-[640px]:size-20"
        >
          {avatarUrl ? <img src={avatarUrl} alt="" className="size-full object-cover" /> : initialsOf(displayName)}
        </span>
        <button
          type="button"
          aria-label={t('Upload new avatar')}
          onClick={() => input.current?.click()}
          className="absolute -right-1 -bottom-1 inline-flex size-8 items-center justify-center rounded-pill bg-surface text-navy-700 shadow-md hover:text-blue-500"
        >
          <Camera size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div className="min-w-0 flex-1 basis-48">
        {title}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="group/icon inline-flex h-8 items-center gap-1.5 rounded-pill pr-2 text-[13px] leading-5 font-semibold text-navy-700 hover:text-blue-500"
          >
            <Upload size={16} strokeWidth={1.75} aria-hidden="true" className="transition-[stroke-width] duration-150 group-hover/icon:stroke-[2.5]" />
            {t('Upload new avatar')}
          </button>
          <button
            type="button"
            onClick={() => {
              setError(undefined)
              onChange(null)
            }}
            disabled={!avatarUrl}
            className="inline-flex h-8 items-center rounded-pill pr-2 text-[13px] leading-5 font-semibold text-text-muted hover:text-red-500 disabled:opacity-50 disabled:hover:text-text-muted"
          >
            {t('Remove')}
          </button>
        </div>
        {error && (
          <p role="alert" className="m-0 mt-1 flex items-start gap-1.5 text-[12px] leading-4 text-navy-900">
            <CircleAlert size={14} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0 text-red-500" />
            {error}
          </p>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          handleFile(event.target.files?.[0])
          // เลือกไฟล์เดิมซ้ำได้อีกครั้ง
          event.target.value = ''
        }}
      />
    </div>
  )
}
