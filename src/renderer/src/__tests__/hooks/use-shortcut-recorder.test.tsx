import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShortcutRecorder } from '@/hooks/use-shortcut-recorder'

describe('useShortcutRecorder', () => {
  const onRecord = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'platform', { value: 'Win32', configurable: true })
  })

  it('starts not recording', () => {
    const { result } = renderHook(() => useShortcutRecorder({ onRecord }))
    expect(result.current.recording).toBe(false)
    expect(result.current.displayValue).toBe('')
  })

  it('startRecording sets recording state', () => {
    const { result } = renderHook(() => useShortcutRecorder({ onRecord }))
    act(() => {
      result.current.startRecording()
    })
    expect(result.current.recording).toBe(true)
    expect(result.current.displayValue).toBe('Presiona teclas...')
  })

  it('stopRecording clears recording state', () => {
    const { result } = renderHook(() => useShortcutRecorder({ onRecord }))
    act(() => {
      result.current.startRecording()
    })
    act(() => {
      result.current.stopRecording()
    })
    expect(result.current.recording).toBe(false)
  })

  it('records key combo on keydown+keyup with modifier+main key', () => {
    const { result } = renderHook(() => useShortcutRecorder({ onRecord }))
    act(() => {
      result.current.startRecording()
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control', cancelable: true }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', cancelable: true }))
    })
    expect(result.current.displayValue).toContain('Ctrl')
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control', cancelable: true }))
    })
    expect(onRecord).toHaveBeenCalledWith('CommandOrControl+K')
    expect(result.current.recording).toBe(false)
  })

  it('does not record without main key', () => {
    const { result } = renderHook(() => useShortcutRecorder({ onRecord }))
    act(() => {
      result.current.startRecording()
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control', cancelable: true }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control', cancelable: true }))
    })
    expect(onRecord).not.toHaveBeenCalled()
  })

  it('does not record without modifier', () => {
    const { result } = renderHook(() => useShortcutRecorder({ onRecord }))
    act(() => {
      result.current.startRecording()
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', cancelable: true }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'k', cancelable: true }))
    })
    expect(onRecord).not.toHaveBeenCalled()
  })

  it('does not listen when not recording', () => {
    const { result } = renderHook(() => useShortcutRecorder({ onRecord }))
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control', cancelable: true }))
    })
    expect(result.current.displayValue).toBe('')
  })

  it('records Meta+key combo as CommandOrControl', () => {
    const { result } = renderHook(() => useShortcutRecorder({ onRecord }))
    act(() => {
      result.current.startRecording()
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Meta', cancelable: true }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', cancelable: true }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'c', cancelable: true }))
    })
    expect(onRecord).toHaveBeenCalledWith('CommandOrControl+C')
  })

  it('records Alt+key combo', () => {
    const { result } = renderHook(() => useShortcutRecorder({ onRecord }))
    act(() => {
      result.current.startRecording()
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt', cancelable: true }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', cancelable: true }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'x', cancelable: true }))
    })
    expect(onRecord).toHaveBeenCalledWith('Alt+X')
  })

  it('records Shift+key combo', () => {
    const { result } = renderHook(() => useShortcutRecorder({ onRecord }))
    act(() => {
      result.current.startRecording()
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', cancelable: true }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', cancelable: true }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'F5', cancelable: true }))
    })
    expect(onRecord).toHaveBeenCalledWith('Shift+F5')
  })

  it('formats multi-character keys without uppercasing', () => {
    const { result } = renderHook(() => useShortcutRecorder({ onRecord }))
    act(() => {
      result.current.startRecording()
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control', cancelable: true }))
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }))
    })
    expect(result.current.displayValue).toContain('Enter')
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', cancelable: true }))
    })
    expect(onRecord).toHaveBeenCalledWith('CommandOrControl+Enter')
  })
})
