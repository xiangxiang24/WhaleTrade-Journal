import { createContext } from 'react'
import type { Language } from '../types/account'

export type TranslateVars = Record<string, string | number>

/** แปลข้อความ UI: ใช้ข้อความอังกฤษเป็น key, ไม่มีคำแปลให้ใช้ข้อความเดิม, {name} แทนค่าจาก vars */
export type Translate = (text: string, vars?: TranslateVars) => string

export type I18nValue = {
  language: Language
  /** รหัสภาษาสำหรับ Intl (ใช้ปฏิทินคริสต์ศักราชเสมอ เพื่อให้ปีตรงกับข้อมูล) */
  locale: string
  t: Translate
}

export const I18nContext = createContext<I18nValue | null>(null)
