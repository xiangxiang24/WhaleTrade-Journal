import { useCallback, useRef, useState } from 'react'

const LEAVE_MS = 250

// เปลี่ยนหน้า: ตั้ง leaving = true ให้เนื้อหาเล่นแอนิเมชันออก แล้วค่อยเรียก callback นำทาง
// leaveTo เป็นฟังก์ชันตัวเดิมตลอด จึงใช้ใน useEffect ได้โดยไม่ทำให้ effect รันซ้ำ
export function usePageLeave() {
  const [leaving, setLeaving] = useState(false)
  const leavingRef = useRef(false)

  const leaveTo = useCallback((go?: () => void) => {
    if (!go || leavingRef.current) return
    leavingRef.current = true
    setLeaving(true)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTimeout(go, reduceMotion ? 0 : LEAVE_MS)
  }, [])

  return { leaving, leaveTo }
}
