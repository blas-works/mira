import { globalShortcut } from 'electron'
import { getSettings } from './store'

interface ShortcutCallbacks {
  onCapture: () => void
}

let currentCallbacks: ShortcutCallbacks | null = null

function isValidAccelerator(accelerator: string): boolean {
  const parts = accelerator.split('+')
  const modifiers = new Set(['CommandOrControl', 'Control', 'Command', 'Alt', 'Shift', 'Super'])
  const hasMainKey = parts.some((p) => !modifiers.has(p))
  const hasModifier = parts.some((p) => modifiers.has(p))
  return hasMainKey && hasModifier && parts.length >= 2
}

export function registerShortcuts(callbacks: ShortcutCallbacks): void {
  currentCallbacks = callbacks
  const settings = getSettings()

  unregisterAllShortcuts()

  if (isValidAccelerator(settings.shortcuts.captureArea)) {
    try {
      globalShortcut.register(settings.shortcuts.captureArea, callbacks.onCapture)
    } catch (err) {
      console.error('Failed to register capture shortcut:', err)
    }
  } else {
    console.warn('Invalid capture accelerator:', settings.shortcuts.captureArea)
  }
}

export function reregisterShortcuts(): void {
  if (currentCallbacks) {
    registerShortcuts(currentCallbacks)
  }
}

export function unregisterAllShortcuts(): void {
  globalShortcut.unregisterAll()
}
