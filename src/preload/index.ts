import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/constants'
import type { AppSettings, EditorData } from '../shared/types'

const api = {
  window: {
    close: (): void => {
      ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE)
    }
  },
  settings: {
    load: (): Promise<AppSettings> => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_LOAD),
    update: (partial: Partial<AppSettings>): Promise<AppSettings> =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, partial),
    registerShortcut: (action: string, keys: string): Promise<AppSettings> =>
      ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_REGISTER, { action, keys })
  },
  capture: {
    onStart: (callback: (data: unknown) => void) => {
      ipcRenderer.on(IPC_CHANNELS.CAPTURE_START, (_event, data) => callback(data))
    },
    openEditor: (data: EditorData): void => {
      ipcRenderer.send(IPC_CHANNELS.CAPTURE_OPEN_EDITOR, data)
    },
    copy: (dataURL: string): void => {
      ipcRenderer.send(IPC_CHANNELS.CAPTURE_COPY, { dataURL })
    },
    save: (dataURL: string): void => {
      ipcRenderer.send(IPC_CHANNELS.CAPTURE_SAVE, { dataURL })
    },
    cancel: (): void => {
      ipcRenderer.send(IPC_CHANNELS.CAPTURE_CANCEL)
    }
  },
  editor: {
    onInit: (callback: (data: unknown) => void) => {
      ipcRenderer.on(IPC_CHANNELS.EDITOR_INIT, (_event, data) => callback(data))
    },
    copy: (dataURL: string): void => {
      ipcRenderer.send(IPC_CHANNELS.EDITOR_COPY, { dataURL })
    },
    save: (dataURL: string): void => {
      ipcRenderer.send(IPC_CHANNELS.EDITOR_SAVE, { dataURL })
    },
    cancel: (): void => {
      ipcRenderer.send(IPC_CHANNELS.EDITOR_CANCEL)
    },
    resize: (width: number, height: number): void => {
      ipcRenderer.send(IPC_CHANNELS.EDITOR_RESIZE, { width, height })
    }
  },
  update: {
    check: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_CHECK),
    getStatus: (): Promise<unknown> => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_GET_STATUS),
    restart: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_RESTART),
    snooze: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_SNOOZE),
    brewUpgrade: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_BREW_UPGRADE),
    onStatus: (callback: (status: unknown) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, status: unknown): void => callback(status)
      ipcRenderer.on(IPC_CHANNELS.UPDATE_STATUS, handler)
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_STATUS, handler)
      }
    }
  }
}

export type MiraAPI = typeof api

contextBridge.exposeInMainWorld('api', api)
