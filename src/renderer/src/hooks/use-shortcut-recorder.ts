import { useState, useCallback, useEffect, useRef } from 'react'

interface UseShortcutRecorderOptions {
  onRecord: (keys: string) => void
}

const isMac = navigator.platform.includes('Mac')

const KEY_MAP: Record<string, string> = {
  Meta: isMac ? '⌘' : 'Super',
  Control: isMac ? '⌃' : 'Ctrl',
  Alt: isMac ? '⌥' : 'Alt',
  Shift: isMac ? '⇧' : 'Shift'
}

function formatKeyCombo(keys: Set<string>): string {
  const modifiers: string[] = []
  let mainKey = ''

  for (const key of keys) {
    if (KEY_MAP[key]) {
      modifiers.push(KEY_MAP[key])
    } else {
      mainKey = key.length === 1 ? key.toUpperCase() : key
    }
  }

  return [...modifiers, mainKey].filter(Boolean).join(' ')
}

function toElectronAccelerator(keys: Set<string>): string {
  const parts: string[] = []
  let mainKey = ''

  for (const key of keys) {
    if (key === 'Meta') parts.push('CommandOrControl')
    else if (key === 'Control') parts.push('CommandOrControl')
    else if (key === 'Alt') parts.push('Alt')
    else if (key === 'Shift') parts.push('Shift')
    else mainKey = key.length === 1 ? key.toUpperCase() : key
  }

  if (mainKey) parts.push(mainKey)
  return parts.join('+')
}

interface UseShortcutRecorderReturn {
  recording: boolean
  displayValue: string
  startRecording: () => void
  stopRecording: () => void
}

export function useShortcutRecorder({
  onRecord
}: UseShortcutRecorderOptions): UseShortcutRecorderReturn {
  const [recording, setRecording] = useState(false)
  const [displayValue, setDisplayValue] = useState('')
  const keysRef = useRef<Set<string>>(new Set())

  const startRecording = useCallback(() => {
    setRecording(true)
    setDisplayValue('Presiona teclas...')
    keysRef.current.clear()
  }, [])

  const stopRecording = useCallback(() => {
    setRecording(false)
  }, [])

  useEffect(() => {
    if (!recording) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      e.preventDefault()
      e.stopPropagation()
      keysRef.current.add(e.key)
      setDisplayValue(formatKeyCombo(keysRef.current))
    }

    const handleKeyUp = (e: KeyboardEvent): void => {
      e.preventDefault()
      e.stopPropagation()

      const modifierKeys = new Set(['Meta', 'Control', 'Alt', 'Shift'])
      const hasMainKey = [...keysRef.current].some((k) => !modifierKeys.has(k))
      const hasModifier = [...keysRef.current].some((k) => modifierKeys.has(k))

      if (hasMainKey && hasModifier) {
        const accelerator = toElectronAccelerator(keysRef.current)
        onRecord(accelerator)
        setRecording(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [recording, onRecord])

  return { recording, displayValue, startRecording, stopRecording }
}
