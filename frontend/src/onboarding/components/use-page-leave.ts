import { useCallback, useState } from 'react'

const LEAVE_MS = 250

// เปลี่ยนหน้า: ตั้ง leaving = true ให้เนื้อหาเล่นแอนิเมชันออก แล้วค่อยเรียก callback นำทาง
export function usePageLeave() {
  const [leaving, setLeaving] = useState(false)

  const leaveTo = useCallback(
    (go?: () => void) => {
      if (!go || leaving) return
      setLeaving(true)
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setTimeout(go, reduceMotion ? 0 : LEAVE_MS)
    },
    [leaving],
  )

  return { leaving, leaveTo }
}
