import { describe, it, expect, vi, type Mock } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSettings } from '@/hooks/use-settings'
import { DEFAULT_SETTINGS } from '@shared/constants'

describe('useSettings', () => {
  it('starts with default settings and loading true', () => {
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS)
    expect(result.current.loading).toBe(true)
  })

  it('loads settings and sets loading to false', async () => {
    const loadedSettings = {
      launchAtStartup: true,
      captureSound: false,
      showMagnifier: false,
      shortcuts: { captureArea: 'Ctrl+Shift+A' }
    }
    ;(window.api.settings.load as unknown as Mock) = vi.fn().mockResolvedValue(loadedSettings)

    const { result } = renderHook(() => useSettings())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.settings).toEqual(loadedSettings)
  })

  it('updateSetting calls api and updates state', async () => {
    const updated = { ...DEFAULT_SETTINGS, captureSound: false }
    ;(window.api.settings.load as unknown as Mock) = vi.fn().mockResolvedValue(DEFAULT_SETTINGS)
    ;(window.api.settings.update as unknown as Mock) = vi.fn().mockResolvedValue(updated)

    const { result } = renderHook(() => useSettings())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    await act(async () => {
      await result.current.updateSetting('captureSound', false)
    })
    expect(window.api.settings.update).toHaveBeenCalledWith({ captureSound: false })
    expect(result.current.settings.captureSound).toBe(false)
  })

  it('updateShortcut calls api and updates state', async () => {
    const updated = { ...DEFAULT_SETTINGS, shortcuts: { captureArea: 'Ctrl+Shift+S' } }
    ;(window.api.settings.load as unknown as Mock) = vi.fn().mockResolvedValue(DEFAULT_SETTINGS)
    ;(window.api.settings.registerShortcut as unknown as Mock) = vi.fn().mockResolvedValue(updated)

    const { result } = renderHook(() => useSettings())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    await act(async () => {
      await result.current.updateShortcut('captureArea', 'Ctrl+Shift+S')
    })
    expect(window.api.settings.registerShortcut).toHaveBeenCalledWith('captureArea', 'Ctrl+Shift+S')
    expect(result.current.settings.shortcuts.captureArea).toBe('Ctrl+Shift+S')
  })
})
