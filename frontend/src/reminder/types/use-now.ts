import { useEffect, useState } from 'react'

// เวลาปัจจุบันที่อัปเดตทุกนาที ให้สถานะ "ถึงเวลาแล้ว" และจำนวน badge เปลี่ยนเองโดยไม่ต้องรีเฟรช
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}
