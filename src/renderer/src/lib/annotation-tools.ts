import type {
  Annotation,
  AnnotationTool,
  PenStroke,
  ArrowAnnotation,
  RectAnnotation,
  BlurAnnotation
} from '@shared/types'

export interface Point {
  x: number
  y: number
}

export interface ToolHandler {
  onMouseDown(coords: Point, color: string): void
  onMouseMove(coords: Point, color: string): Annotation | null
  onMouseUp(coords: Point, color: string): Annotation | null
  reset(): void
  readonly isTextTool?: boolean
  readonly isEyedropperTool?: boolean
}

const PEN_WIDTH = 3
const ARROW_WIDTH = 3
const RECT_WIDTH = 2

class SelectToolHandler implements ToolHandler {
  onMouseDown(): void {
    /* empty */
  }
  onMouseMove(): Annotation | null {
    return null
  }
  onMouseUp(): Annotation | null {
    return null
  }
  reset(): void {
    /* empty */
  }
}

class PenToolHandler implements ToolHandler {
  private drawing = false
  private points: Point[] = []

  onMouseDown(coords: Point): void {
    this.drawing = true
    this.points = [coords]
  }

  onMouseMove(coords: Point, color: string): Annotation | null {
    if (!this.drawing) return null
    this.points.push(coords)
    return {
      type: 'pen',
      points: [...this.points],
      color,
      width: PEN_WIDTH
    } satisfies PenStroke
  }

  onMouseUp(_coords: Point, color: string): Annotation | null {
    if (!this.drawing) return null
    this.drawing = false
    if (this.points.length <= 1) return null
    const annotation: PenStroke = {
      type: 'pen',
      points: [...this.points],
      color,
      width: PEN_WIDTH
    }
    this.points = []
    return annotation
  }

  reset(): void {
    this.drawing = false
    this.points = []
  }
}

class ArrowToolHandler implements ToolHandler {
  private drawing = false
  private start: Point | null = null

  onMouseDown(coords: Point): void {
    this.drawing = true
    this.start = coords
  }

  onMouseMove(coords: Point, color: string): Annotation | null {
    if (!this.drawing || !this.start) return null
    return {
      type: 'arrow',
      start: this.start,
      end: coords,
      color,
      width: ARROW_WIDTH
    } satisfies ArrowAnnotation
  }

  onMouseUp(coords: Point, color: string): Annotation | null {
    if (!this.drawing || !this.start) return null
    this.drawing = false
    const annotation: ArrowAnnotation = {
      type: 'arrow',
      start: this.start,
      end: coords,
      color,
      width: ARROW_WIDTH
    }
    this.start = null
    return annotation
  }

  reset(): void {
    this.drawing = false
    this.start = null
  }
}

class RectToolHandler implements ToolHandler {
  private drawing = false
  private start: Point | null = null

  onMouseDown(coords: Point): void {
    this.drawing = true
    this.start = coords
  }

  onMouseMove(coords: Point, color: string): Annotation | null {
    if (!this.drawing || !this.start) return null
    return {
      type: 'rect',
      start: this.start,
      end: coords,
      color,
      width: RECT_WIDTH
    } satisfies RectAnnotation
  }

  onMouseUp(coords: Point, color: string): Annotation | null {
    if (!this.drawing || !this.start) return null
    this.drawing = false
    const annotation: RectAnnotation = {
      type: 'rect',
      start: this.start,
      end: coords,
      color,
      width: RECT_WIDTH
    }
    this.start = null
    return annotation
  }

  reset(): void {
    this.drawing = false
    this.start = null
  }
}

class TextToolHandler implements ToolHandler {
  readonly isTextTool = true

  onMouseDown(): void {
    /* empty */
  }
  onMouseMove(): Annotation | null {
    return null
  }
  onMouseUp(): Annotation | null {
    return null
  }
  reset(): void {
    /* empty */
  }
}

class BlurToolHandler implements ToolHandler {
  private drawing = false
  private start: Point | null = null

  onMouseDown(coords: Point): void {
    this.drawing = true
    this.start = coords
  }

  onMouseMove(coords: Point): Annotation | null {
    if (!this.drawing || !this.start) return null
    return {
      type: 'blur',
      start: this.start,
      end: coords
    } satisfies BlurAnnotation
  }

  onMouseUp(coords: Point): Annotation | null {
    if (!this.drawing || !this.start) return null
    this.drawing = false
    const w = Math.abs(coords.x - this.start.x)
    const h = Math.abs(coords.y - this.start.y)
    if (w < 4 && h < 4) {
      this.start = null
      return null
    }
    const annotation: BlurAnnotation = {
      type: 'blur',
      start: this.start,
      end: coords
    }
    this.start = null
    return annotation
  }

  reset(): void {
    this.drawing = false
    this.start = null
  }
}

class EyedropperToolHandler implements ToolHandler {
  readonly isEyedropperTool = true

  onMouseDown(): void {
    /* handled externally */
  }
  onMouseMove(): Annotation | null {
    return null
  }
  onMouseUp(): Annotation | null {
    return null
  }
  reset(): void {
    /* empty */
  }
}

export function createToolHandlers(): Record<AnnotationTool, ToolHandler> {
  return {
    select: new SelectToolHandler(),
    pen: new PenToolHandler(),
    arrow: new ArrowToolHandler(),
    rect: new RectToolHandler(),
    text: new TextToolHandler(),
    blur: new BlurToolHandler(),
    eyedropper: new EyedropperToolHandler()
  }
}
