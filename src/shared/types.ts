export interface AppSettings {
  launchAtStartup: boolean
  captureSound: boolean
  showMagnifier: boolean
  shortcuts: ShortcutConfig
}

export interface ShortcutConfig {
  captureArea: string
}

export interface DisplayCapture {
  imageDataURL: string
  bounds: DisplayBounds
}

export interface CaptureData {
  displays: DisplayCapture[]
  virtualBounds: DisplayBounds
}

export interface DisplayBounds {
  x: number
  y: number
  width: number
  height: number
  scaleFactor: number
}

export interface SelectionRect {
  x: number
  y: number
  width: number
  height: number
}

export type AnnotationTool = 'select' | 'pen' | 'arrow' | 'rect' | 'text' | 'blur' | 'eyedropper'

export interface AnnotationColor {
  name: string
  value: string
}

export interface PenStroke {
  type: 'pen'
  points: { x: number; y: number }[]
  color: string
  width: number
}

export interface ArrowAnnotation {
  type: 'arrow'
  start: { x: number; y: number }
  end: { x: number; y: number }
  color: string
  width: number
}

export interface TextAnnotation {
  type: 'text'
  position: { x: number; y: number }
  content: string
  color: string
  fontSize: number
}

export interface RectAnnotation {
  type: 'rect'
  start: { x: number; y: number }
  end: { x: number; y: number }
  color: string
  width: number
}

export interface BlurAnnotation {
  type: 'blur'
  start: { x: number; y: number }
  end: { x: number; y: number }
}

export type Annotation =
  | PenStroke
  | ArrowAnnotation
  | RectAnnotation
  | TextAnnotation
  | BlurAnnotation

export interface EditorData {
  imageDataURL: string
  width: number
  height: number
  scaleFactor: number
}

export type UpdatePriority = 'normal' | 'security' | 'critical'

export interface UpdateMetadata {
  version: string
  priority: UpdatePriority
  message?: string
  forceRestart?: boolean
  releaseDate?: string
}

export interface UpdateInfo {
  available: boolean
  version?: string
  priority?: UpdatePriority
  message?: string
  progress?: number
  downloaded?: boolean
  brewUpdate?: boolean
  brewUpdating?: boolean
  brewError?: string
}

export interface PendingUpdate {
  version: string
  priority: UpdatePriority
  message?: string
}
