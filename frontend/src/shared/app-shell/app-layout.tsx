import type { ReactNode } from 'react'
import Sidebar from '../sidebar/sidebar'
import type { SidebarKey, SidebarUser } from '../types/sidebar'
import TopBar from '../top-bar/top-bar'
import AppShell from './app-shell'

type AppLayoutProps = {
  /** เมนูที่กำลังเลือกใน Sidebar */
  active: SidebarKey
  user: SidebarUser
  /** จำนวน Reminder ที่ถึงเวลาแล้ว (badge ที่เมนู Reminder) */
  reminderBadge?: number
  onNavigate: (key: SidebarKey) => void
  onLogout: () => void
  children: ReactNode
}

// โครงหน้าหลังเข้าสู่ระบบแบบครบชุด (AppShell + Sidebar + TopBar) ให้ทุกหน้าเรียกใช้ตัวเดียว
export default function AppLayout({
  active,
  user,
  reminderBadge,
  onNavigate,
  onLogout,
  children,
}: AppLayoutProps) {
  return (
    <AppShell
      sidebar={
        <Sidebar
          active={active}
          user={user}
          reminderBadge={reminderBadge}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      }
      topBar={<TopBar displayName={user.displayName} avatarUrl={user.avatarUrl} />}
    >
      {children}
    </AppShell>
  )
}
