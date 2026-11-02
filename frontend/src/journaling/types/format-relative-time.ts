// เวลาสัมพัทธ์สำหรับป้าย "Draft Autosaved • Just now"
export function formatRelativeTime(savedAt: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - savedAt) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
}
