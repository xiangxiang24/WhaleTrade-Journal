import type { Translate } from '../../shared/i18n/i18n-context'
import { fill } from '../../shared/i18n/use-i18n'

// เวลาสัมพัทธ์สำหรับป้าย "Draft Autosaved • Just now"
export function formatRelativeTime(savedAt: number, now: number, t: Translate = (text, vars) => fill(text, vars)): string {
  const seconds = Math.max(0, Math.floor((now - savedAt) / 1000))
  if (seconds < 60) return t('Just now')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return t('{n} min ago', { n: minutes })
  const hours = Math.floor(minutes / 60)
  return t(hours === 1 ? '{n} hour ago' : '{n} hours ago', { n: hours })
}
