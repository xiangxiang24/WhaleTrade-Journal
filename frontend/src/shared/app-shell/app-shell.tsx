import type { ReactNode } from 'react'

type AppShellProps = {
  sidebar: ReactNode
  topBar: ReactNode
  /** เนื้อหาของหน้า (เลื่อนเองเฉพาะส่วนนี้) */
  children: ReactNode
}

// โครงหน้าหลังเข้าสู่ระบบ: Sidebar ลอยทางซ้าย, คอลัมน์ขวา = TopBar + เนื้อหา
// ระยะขอบหน้าต่างซ้ายและขวาเท่ากัน (24) บนล่าง 16, Sidebar กับเนื้อหาห่างกัน 24 เนื้อหาเลื่อนได้โดยไม่แสดงแถบเลื่อน
export default function AppShell({ sidebar, topBar, children }: AppShellProps) {
  return (
    <div className="flex h-screen gap-4 bg-paper px-4 py-4 min-[640px]:gap-6 min-[640px]:px-6">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {topBar}
        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
