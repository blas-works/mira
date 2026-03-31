import { ElectronAPI } from '@electron-toolkit/preload'
import type { MiraAPI } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: MiraAPI
  }
}
