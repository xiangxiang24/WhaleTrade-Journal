import { useContext } from 'react'
import { I18nContext, type I18nValue } from './i18n-context'

// ใช้นอก provider ได้ (เช่น หน้า onboarding) จะได้ภาษาอังกฤษตามเดิม
const FALLBACK: I18nValue = {
  language: 'en',
  locale: 'en-US',
  t: (text, vars) => fill(text, vars),
}

export function fill(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match))
}

export function useI18n(): I18nValue {
  return useContext(I18nContext) ?? FALLBACK
}
