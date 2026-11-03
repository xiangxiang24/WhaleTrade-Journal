import { useCallback, useEffect, useState } from 'react'
import {
  changePassword,
  deleteAccount,
  fetchAccount,
  updateEmail,
  updatePreferences,
  updateProfile,
} from '../../shared/data/account'
import type { Account, Language } from '../../shared/types/account'
import type { SettingLoadStatus } from './setting'

// โหลดบัญชี + เก็บค่าที่ยังไม่บันทึก (draft) ของ Account และ Language & Display แยกกัน แต่ละส่วนมี dirty/save/cancel ของตัวเอง
export function useAccount(onChange: (account: Account) => void) {
  const [account, setAccount] = useState<Account | null>(null)
  const [status, setStatus] = useState<SettingLoadStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [timezone, setTimezone] = useState('Asia/Bangkok')

  const adopt = useCallback((next: Account) => {
    setAccount(next)
    setDisplayName(next.displayName)
    setAvatarUrl(next.avatarUrl)
    setLanguage(next.language)
    setTimezone(next.timezone)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAccount()
      .then((loaded) => {
        if (cancelled) return
        adopt(loaded)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [attempt, adopt])

  const reload = useCallback(() => {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }, [])

  const profileDirty = account !== null && (displayName.trim() !== account.displayName || avatarUrl !== account.avatarUrl)
  const prefsDirty = account !== null && (language !== account.language || timezone !== account.timezone)

  const saveProfile = useCallback(async () => {
    const saved = await updateProfile({ displayName: displayName.trim(), avatarUrl })
    adopt({ ...saved, language: saved.language, timezone: saved.timezone })
    onChange(saved)
  }, [displayName, avatarUrl, adopt, onChange])

  const cancelProfile = useCallback(() => {
    if (!account) return
    setDisplayName(account.displayName)
    setAvatarUrl(account.avatarUrl)
  }, [account])

  const savePreferences = useCallback(async () => {
    const saved = await updatePreferences({ language, timezone })
    setAccount(saved)
    onChange(saved)
  }, [language, timezone, onChange])

  const saveEmail = useCallback(
    async (email: string, password: string) => {
      const saved = await updateEmail(email, password)
      setAccount((current) => (current ? { ...current, email: saved.email } : saved))
      onChange(saved)
    },
    [onChange],
  )

  return {
    account,
    status,
    reload,
    displayName,
    setDisplayName,
    avatarUrl,
    setAvatarUrl,
    language,
    setLanguage,
    timezone,
    setTimezone,
    profileDirty,
    prefsDirty,
    saveProfile,
    cancelProfile,
    savePreferences,
    saveEmail,
    changePassword,
    deleteAccount,
  }
}

export type AccountState = ReturnType<typeof useAccount>
