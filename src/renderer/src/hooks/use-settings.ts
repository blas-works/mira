import { useState, useEffect, useCallback } from 'react'
import type { AppSettings } from '@shared/types'
import { DEFAULT_SETTINGS } from '@shared/constants'

interface UseSettingsReturn {
  settings: AppSettings
  loading: boolean
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>
  updateShortcut: (action: string, keys: string) => Promise<void>
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.settings.load().then((loaded) => {
      setSettings(loaded)
      setLoading(false)
    })
  }, [])

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const updated = await window.api.settings.update({ [key]: value })
      setSettings(updated)
    },
    []
  )

  const updateShortcut = useCallback(async (action: string, keys: string) => {
    const updated = await window.api.settings.registerShortcut(action, keys)
    setSettings(updated)
  }, [])

  return { settings, loading, updateSetting, updateShortcut }
}
