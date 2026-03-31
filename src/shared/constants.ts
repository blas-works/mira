import type { AppSettings, AnnotationColor, AnnotationTool } from './types'

export const DEFAULT_SETTINGS: AppSettings = {
  launchAtStartup: false,
  captureSound: true,
  showMagnifier: true,
  shortcuts: {
    captureArea: 'CommandOrControl+1'
  }
}

export const ANNOTATION_COLORS: AnnotationColor[] = [
  { name: 'red', value: '#ef4444' },
  { name: 'yellow', value: '#eab308' },
  { name: 'green', value: '#22c55e' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'white', value: '#fafafa' }
]

export const TOOL_SHORTCUTS: Record<AnnotationTool, { key: string; label: string }> = {
  select: { key: 'V', label: 'Select (V)' },
  pen: { key: 'P', label: 'Pen (P)' },
  arrow: { key: 'A', label: 'Arrow (A)' },
  rect: { key: 'R', label: 'Rectangle (R)' },
  text: { key: 'T', label: 'Text (T)' },
  blur: { key: 'B', label: 'Blur (B)' },
  eyedropper: { key: 'I', label: 'Eyedropper (I)' }
}

export const DEFAULT_RECT_WIDTH = 2

export const IPC_CHANNELS = {
  WINDOW_CLOSE: 'window:close',
  CAPTURE_START: 'capture:start',
  CAPTURE_COPY: 'capture:copy',
  CAPTURE_SAVE: 'capture:save',
  CAPTURE_CANCEL: 'capture:cancel',
  SETTINGS_LOAD: 'settings:load',
  SETTINGS_UPDATE: 'settings:update',
  SHORTCUT_REGISTER: 'shortcut:register',
  CAPTURE_OPEN_EDITOR: 'capture:open-editor',
  EDITOR_INIT: 'editor:init',
  EDITOR_COPY: 'editor:copy',
  EDITOR_SAVE: 'editor:save',
  EDITOR_CANCEL: 'editor:cancel',
  EDITOR_RESIZE: 'editor:resize',
  UPDATE_CHECK: 'update:check',
  UPDATE_GET_STATUS: 'update:get-status',
  UPDATE_RESTART: 'update:restart',
  UPDATE_SNOOZE: 'update:snooze',
  UPDATE_BREW_UPGRADE: 'update:brew-upgrade',
  UPDATE_STATUS: 'update-status'
} as const

export const DEFAULT_PEN_WIDTH = 3
export const DEFAULT_ARROW_WIDTH = 3
export const FONT_SIZES = [
  { label: 'S', value: 12 },
  { label: 'M', value: 16 },
  { label: 'L', value: 22 },
  { label: 'XL', value: 28 }
] as const

export const DEFAULT_FONT_SIZE = 16
export const PIXEL_SIZE = 10
