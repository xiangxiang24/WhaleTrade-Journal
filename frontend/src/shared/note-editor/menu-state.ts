const GRACE_MS = 150

// ติดตามว่าเมนู / เพิ่งเปิดอยู่หรือเพิ่งปิดไป เพื่อให้ Esc ที่ใช้ปิดเมนูไม่ลอยไปปิด modal ที่ครอบตัวแก้ไขอยู่
export function createMenuState() {
  let open = false
  let lastEventAt = 0
  return {
    set(next: boolean) {
      open = next
      lastEventAt = Date.now()
    },
    isOpenOrJustClosed() {
      return open || Date.now() - lastEventAt < GRACE_MS
    },
  }
}
