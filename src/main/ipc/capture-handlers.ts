import { ipcMain, dialog, Notification, screen } from 'electron'
import { writeFile } from 'fs/promises'
import { IPC_CHANNELS } from '../../shared/constants'
import type { EditorData } from '../../shared/types'
import { copyImageToClipboard, copyTextToClipboard } from '../services/clipboard'
import { recognizeText } from '../services/ocr'
import { getSettings } from '../services/store'
import { destroyOverlayWindow } from '../windows/overlay'
import { createEditorWindow, destroyEditorWindow, getEditorWindow } from '../windows/editor'

const DATA_URL_PNG_PREFIX = 'data:image/png;base64,'
const MAX_DATA_URL_LENGTH = 50_000_000

function validatePngDataURL(dataURL: unknown): string {
  if (typeof dataURL !== 'string') {
    throw new Error('dataURL must be a string')
  }
  if (!dataURL.startsWith(DATA_URL_PNG_PREFIX)) {
    throw new Error('dataURL must be a PNG data URL')
  }
  const base64Part = dataURL.slice(DATA_URL_PNG_PREFIX.length)
  if (base64Part.length === 0 || base64Part.length > MAX_DATA_URL_LENGTH) {
    throw new Error('Invalid base64 data length')
  }
  if (!/^[A-Za-z0-9+/]+=*$/.test(base64Part)) {
    throw new Error('Invalid base64 encoding')
  }
  return base64Part
}

function handleCopyAction(dataURL: unknown, destroyFn: () => void): void {
  validatePngDataURL(dataURL)
  copyImageToClipboard(dataURL as string)
  destroyFn()

  new Notification({
    title: 'Mira',
    body: 'Capture copied to clipboard',
    silent: true
  }).show()
}

async function handleSaveAction(dataURL: unknown, destroyFn: () => void): Promise<void> {
  const base64Data = validatePngDataURL(dataURL)

  const result = await dialog.showSaveDialog({
    defaultPath: `mira-${Date.now()}.png`,
    filters: [{ name: 'PNG', extensions: ['png'] }]
  })

  if (!result.canceled && result.filePath) {
    await writeFile(result.filePath, base64Data, 'base64')

    new Notification({
      title: 'Mira',
      body: 'Capture saved',
      silent: true
    }).show()
  }

  destroyFn()
}

async function handleOcrAction(dataURL: unknown, destroyFn: () => void): Promise<void> {
  validatePngDataURL(dataURL)
  const settings = getSettings()

  const text = await recognizeText(dataURL as string, settings.ocrLanguages)
  copyTextToClipboard(text)
  destroyFn()

  new Notification({
    title: 'Mira',
    body: text.length > 0 ? 'Text copied to clipboard' : 'No text detected',
    silent: true
  }).show()
}

export function registerCaptureHandlers(): void {
  ipcMain.on(IPC_CHANNELS.CAPTURE_COPY, (_event, { dataURL }: { dataURL: unknown }) => {
    handleCopyAction(dataURL, destroyOverlayWindow)
  })

  ipcMain.on(IPC_CHANNELS.CAPTURE_SAVE, async (_event, { dataURL }: { dataURL: unknown }) => {
    await handleSaveAction(dataURL, destroyOverlayWindow)
  })

  ipcMain.on(IPC_CHANNELS.CAPTURE_CANCEL, () => {
    destroyOverlayWindow()
  })

  ipcMain.on(IPC_CHANNELS.CAPTURE_OCR, async (_event, { dataURL }: { dataURL: unknown }) => {
    await handleOcrAction(dataURL, destroyOverlayWindow)
  })

  ipcMain.on(IPC_CHANNELS.CAPTURE_OPEN_EDITOR, (_event, data: EditorData) => {
    destroyOverlayWindow()
    createEditorWindow(data)
  })

  ipcMain.on(IPC_CHANNELS.EDITOR_COPY, (_event, { dataURL }: { dataURL: unknown }) => {
    handleCopyAction(dataURL, destroyEditorWindow)
  })

  ipcMain.on(IPC_CHANNELS.EDITOR_SAVE, async (_event, { dataURL }: { dataURL: unknown }) => {
    await handleSaveAction(dataURL, destroyEditorWindow)
  })

  ipcMain.on(IPC_CHANNELS.EDITOR_CANCEL, () => {
    destroyEditorWindow()
  })

  ipcMain.on(IPC_CHANNELS.EDITOR_OCR, async (_event, { dataURL }: { dataURL: unknown }) => {
    await handleOcrAction(dataURL, destroyEditorWindow)
  })

  ipcMain.on(
    IPC_CHANNELS.EDITOR_RESIZE,
    (_event, { width, height }: { width: number; height: number }) => {
      const win = getEditorWindow()
      if (!win || win.isDestroyed()) return

      const primaryDisplay = screen.getPrimaryDisplay()
      const maxW = Math.floor(primaryDisplay.workAreaSize.width * 0.85)
      const maxH = Math.floor(primaryDisplay.workAreaSize.height * 0.85)

      const w = Math.max(300, Math.min(width, maxW))
      const h = Math.max(200, Math.min(height, maxH))

      const x = Math.round(primaryDisplay.workArea.x + (primaryDisplay.workAreaSize.width - w) / 2)
      const y = Math.round(primaryDisplay.workArea.y + (primaryDisplay.workAreaSize.height - h) / 2)

      win.setBounds({ x, y, width: w, height: h })
    }
  )
}
