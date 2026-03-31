import type {
  PenStroke,
  ArrowAnnotation,
  RectAnnotation,
  TextAnnotation,
  BlurAnnotation,
  Annotation
} from '@shared/types'
import { PIXEL_SIZE } from '@shared/constants'

export interface CompositeSource {
  canvas: HTMLCanvasElement
  selectionX: number
  selectionY: number
  scale: number
}

export function drawPenStroke(ctx: CanvasRenderingContext2D, stroke: PenStroke): void {
  if (stroke.points.length < 2) return

  ctx.beginPath()
  ctx.strokeStyle = stroke.color
  ctx.lineWidth = stroke.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

  for (let i = 1; i < stroke.points.length; i++) {
    const prev = stroke.points[i - 1]
    const curr = stroke.points[i]
    const midX = (prev.x + curr.x) / 2
    const midY = (prev.y + curr.y) / 2
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
  }

  const last = stroke.points[stroke.points.length - 1]
  ctx.lineTo(last.x, last.y)
  ctx.stroke()
}

export function drawArrow(ctx: CanvasRenderingContext2D, arrow: ArrowAnnotation): void {
  const { start, end, color, width } = arrow
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.sqrt(dx * dx + dy * dy)
  if (length < 2) return

  const headLength = Math.min(16, length * 0.3)
  const angle = Math.atan2(dy, dx)

  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()

  ctx.beginPath()
  ctx.fillStyle = color
  ctx.moveTo(end.x, end.y)
  ctx.lineTo(
    end.x - headLength * Math.cos(angle - Math.PI / 6),
    end.y - headLength * Math.sin(angle - Math.PI / 6)
  )
  ctx.lineTo(
    end.x - headLength * Math.cos(angle + Math.PI / 6),
    end.y - headLength * Math.sin(angle + Math.PI / 6)
  )
  ctx.closePath()
  ctx.fill()
}

export function drawRect(ctx: CanvasRenderingContext2D, rect: RectAnnotation): void {
  const x = Math.min(rect.start.x, rect.end.x)
  const y = Math.min(rect.start.y, rect.end.y)
  const w = Math.abs(rect.end.x - rect.start.x)
  const h = Math.abs(rect.end.y - rect.start.y)
  if (w < 2 && h < 2) return

  ctx.beginPath()
  ctx.strokeStyle = rect.color
  ctx.lineWidth = rect.width
  ctx.lineJoin = 'miter'
  ctx.strokeRect(x, y, w, h)
}

export function drawText(ctx: CanvasRenderingContext2D, text: TextAnnotation): void {
  ctx.font = `500 ${text.fontSize}px 'Geist Variable', -apple-system, sans-serif`
  ctx.fillStyle = text.color
  ctx.textBaseline = 'top'

  const lines = text.content.split('\n')
  const lineHeight = text.fontSize * 1.4

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], text.position.x, text.position.y + i * lineHeight)
  }
}

export function drawBlur(
  ctx: CanvasRenderingContext2D,
  blur: BlurAnnotation,
  source: CompositeSource
): void {
  const x = Math.min(blur.start.x, blur.end.x)
  const y = Math.min(blur.start.y, blur.end.y)
  const w = Math.abs(blur.end.x - blur.start.x)
  const h = Math.abs(blur.end.y - blur.start.y)
  if (w < 4 && h < 4) return

  const smallW = Math.max(1, Math.ceil(w / PIXEL_SIZE))
  const smallH = Math.max(1, Math.ceil(h / PIXEL_SIZE))

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = smallW
  tempCanvas.height = smallH
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return

  const sx = (source.selectionX + x) * source.scale
  const sy = (source.selectionY + y) * source.scale
  const sw = w * source.scale
  const sh = h * source.scale

  tempCtx.drawImage(source.canvas, sx, sy, sw, sh, 0, 0, smallW, smallH)

  const prevSmoothing = ctx.imageSmoothingEnabled
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, x, y, w, h)
  ctx.imageSmoothingEnabled = prevSmoothing
}

export function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
  source?: CompositeSource | null
): void {
  switch (annotation.type) {
    case 'pen':
      drawPenStroke(ctx, annotation)
      break
    case 'arrow':
      drawArrow(ctx, annotation)
      break
    case 'rect':
      drawRect(ctx, annotation)
      break
    case 'text':
      drawText(ctx, annotation)
      break
    case 'blur':
      if (source) drawBlur(ctx, annotation, source)
      break
  }
}

export function redrawAll(
  ctx: CanvasRenderingContext2D,
  annotations: Annotation[],
  source?: CompositeSource | null
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (const annotation of annotations) {
    drawAnnotation(ctx, annotation, source)
  }
}
