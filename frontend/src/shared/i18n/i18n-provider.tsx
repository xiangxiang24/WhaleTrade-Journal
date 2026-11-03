import { useMemo, type ReactNode } from 'react'
import type { Language } from '../types/account'
import { I18nContext, type I18nValue } from './i18n-context'
import { fill } from './use-i18n'
import { TH } from './th'

type I18nProviderProps = {
  language: Language
  children: ReactNode
}

// ภาษาของส่วนติดต่อผู้ใช้ทั้งแอป (Account.language) ข้อความในโน้ตของผู้ใช้ไม่ผ่านการแปล
export default function I18nProvider({ language, children }: I18nProviderProps) {
  const value = useMemo<I18nValue>(
    () => ({
      language,
      locale: language === 'th' ? 'th-TH-u-ca-gregory' : 'en-US',
      t: (text, vars) => fill(language === 'th' ? (TH[text] ?? text) : text, vars),
    }),
    [language],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
