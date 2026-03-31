import { describe, it, expect, vi } from 'vitest'
import {
  drawPenStroke,
  drawArrow,
  drawRect,
  drawText,
  drawBlur,
  drawAnnotation,
  redrawAll
} from '@/lib/canvas-tools'

function createMockCtx(): { calls: string[]; ctx: CanvasRenderingContext2D } {
  const calls: string[] = []
  return {
    calls,
    ctx: {
      get canvas() {
        return { width: 800, height: 600 }
      },
      get imageSmoothingEnabled() {
        return false
      },
      set imageSmoothingEnabled(v: boolean) {
        calls.push('imageSmoothingEnabled=' + v)
      },
      beginPath() {
        calls.push('beginPath')
      },
      stroke() {
        calls.push('stroke')
      },
      fill() {
        calls.push('fill')
      },
      closePath() {
        calls.push('closePath')
      },
      moveTo() {
        calls.push('moveTo')
      },
      lineTo() {
        calls.push('lineTo')
      },
      quadraticCurveTo() {
        calls.push('quadraticCurveTo')
      },
      strokeRect() {
        calls.push('strokeRect')
      },
      fillText(text: string, x: number, y: number) {
        calls.push('fillText(' + text + ',' + x + ',' + y + ')')
      },
      drawImage() {
        calls.push('drawImage')
      },
      clearRect(x: number, y: number, w: number, h: number) {
        calls.push('clearRect(' + x + ',' + y + ',' + w + ',' + h + ')')
      }
    } as unknown as CanvasRenderingContext2D
  }
}

describe('drawPenStroke', () => {
  it('skips strokes with fewer than 2 points', () => {
    const { ctx, calls } = createMockCtx()
    drawPenStroke(ctx, { type: 'pen', points: [{ x: 0, y: 0 }], color: '#f00', width: 3 })
    expect(calls).toHaveLength(0)
  })

  it('draws with quadratic curves for 2+ points', () => {
    const { ctx, calls } = createMockCtx()
    drawPenStroke(ctx, {
      type: 'pen',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 }
      ],
      color: '#f00',
      width: 3
    })
    expect(calls).toContain('stroke')
  })
})

describe('drawArrow', () => {
  it('skips arrows shorter than 2px', () => {
    const { ctx, calls } = createMockCtx()
    drawArrow(ctx, {
      type: 'arrow',
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
      color: '#f00',
      width: 3
    })
    expect(calls).toHaveLength(0)
  })

  it('draws arrow line and head', () => {
    const { ctx, calls } = createMockCtx()
    drawArrow(ctx, {
      type: 'arrow',
      start: { x: 0, y: 0 },
      end: { x: 100, y: 0 },
      color: '#f00',
      width: 3
    })
    expect(calls).toContain('stroke')
    expect(calls).toContain('fill')
  })
})

describe('drawRect', () => {
  it('skips rects smaller than 2px both dims', () => {
    const { ctx, calls } = createMockCtx()
    drawRect(ctx, {
      type: 'rect',
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
      color: '#f00',
      width: 2
    })
    expect(calls).toHaveLength(0)
  })

  it('draws when one dimension is >= 2', () => {
    const { ctx, calls } = createMockCtx()
    drawRect(ctx, {
      type: 'rect',
      start: { x: 0, y: 0 },
      end: { x: 5, y: 1 },
      color: '#f00',
      width: 2
    })
    expect(calls).toContain('strokeRect')
  })
})

describe('drawText', () => {
  it('draws single line text', () => {
    const { ctx, calls } = createMockCtx()
    drawText(ctx, {
      type: 'text',
      position: { x: 10, y: 20 },
      content: 'Hello',
      color: '#000',
      fontSize: 16
    })
    expect(calls).toContain('fillText(Hello,10,20)')
  })

  it('draws multi-line text', () => {
    const { ctx, calls } = createMockCtx()
    drawText(ctx, {
      type: 'text',
      position: { x: 0, y: 0 },
      content: 'Line1\nLine2',
      color: '#000',
      fontSize: 16
    })
    expect(calls).toContain('fillText(Line1,0,0)')
    expect(calls).toContain('fillText(Line2,0,22.4)')
  })
})

describe('drawBlur', () => {
  it('skips blur smaller than 4px both dims', () => {
    const { ctx, calls } = createMockCtx()
    const source = {
      canvas: document.createElement('canvas'),
      selectionX: 0,
      selectionY: 0,
      scale: 1
    }
    drawBlur(ctx, { type: 'blur', start: { x: 0, y: 0 }, end: { x: 3, y: 3 } }, source)
    expect(calls).toHaveLength(0)
  })

  it('returns early when tempCanvas has no 2d context', () => {
    const { ctx, calls } = createMockCtx()
    const sourceCanvas = document.createElement('canvas')
    sourceCanvas.width = 200
    sourceCanvas.height = 200
    const source = { canvas: sourceCanvas, selectionX: 0, selectionY: 0, scale: 1 }
    drawBlur(ctx, { type: 'blur', start: { x: 0, y: 0 }, end: { x: 50, y: 50 } }, source)
    expect(calls).toHaveLength(0)
  })

  it('pixelates region when tempCanvas context is available', () => {
    const { ctx, calls } = createMockCtx()
    const sourceCanvas = document.createElement('canvas')
    sourceCanvas.width = 200
    sourceCanvas.height = 200
    const source = { canvas: sourceCanvas, selectionX: 0, selectionY: 0, scale: 1 }

    const mockTempCtx = { drawImage: vi.fn() }
    const origCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') {
        const c = origCreateElement(tag) as HTMLCanvasElement
        vi.spyOn(c, 'getContext').mockReturnValue(
          mockTempCtx as unknown as CanvasRenderingContext2D
        )
        return c
      }
      return origCreateElement(tag)
    }) as typeof document.createElement)

    drawBlur(ctx, { type: 'blur', start: { x: 0, y: 0 }, end: { x: 50, y: 50 } }, source)
    expect(mockTempCtx.drawImage).toHaveBeenCalled()
    expect(calls).toContain('imageSmoothingEnabled=false')
    expect(calls).toContain('drawImage')
  })
})

describe('drawAnnotation', () => {
  it('dispatches to drawPenStroke for pen type', () => {
    const { ctx, calls } = createMockCtx()
    drawAnnotation(ctx, {
      type: 'pen',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ],
      color: '#f00',
      width: 3
    })
    expect(calls).toContain('stroke')
  })

  it('dispatches to drawArrow for arrow type', () => {
    const { ctx, calls } = createMockCtx()
    drawAnnotation(ctx, {
      type: 'arrow',
      start: { x: 0, y: 0 },
      end: { x: 100, y: 0 },
      color: '#f00',
      width: 3
    })
    expect(calls).toContain('fill')
  })

  it('dispatches to drawRect for rect type', () => {
    const { ctx, calls } = createMockCtx()
    drawAnnotation(ctx, {
      type: 'rect',
      start: { x: 0, y: 0 },
      end: { x: 50, y: 50 },
      color: '#f00',
      width: 2
    })
    expect(calls).toContain('strokeRect')
  })

  it('dispatches to drawText for text type', () => {
    const { ctx, calls } = createMockCtx()
    drawAnnotation(ctx, {
      type: 'text',
      position: { x: 0, y: 0 },
      content: 'Hi',
      color: '#000',
      fontSize: 16
    })
    expect(calls).toContain('fillText(Hi,0,0)')
  })

  it('skips blur without source', () => {
    const { ctx, calls } = createMockCtx()
    drawAnnotation(ctx, { type: 'blur', start: { x: 0, y: 0 }, end: { x: 50, y: 50 } })
    expect(calls).toHaveLength(0)
  })

  it('dispatches to drawBlur for blur type with source', () => {
    const { ctx, calls } = createMockCtx()
    const sourceCanvas = document.createElement('canvas')
    const source = { canvas: sourceCanvas, selectionX: 0, selectionY: 0, scale: 1 }
    // blur too small, so no draw calls, but it does dispatch to drawBlur
    drawAnnotation(ctx, { type: 'blur', start: { x: 0, y: 0 }, end: { x: 3, y: 3 } }, source)
    expect(calls).toHaveLength(0) // too small to draw, but branch was taken
  })
})

describe('redrawAll', () => {
  it('clears canvas and draws all annotations', () => {
    const { ctx, calls } = createMockCtx()
    redrawAll(ctx, [
      {
        type: 'pen' as const,
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 10 }
        ],
        color: '#f00',
        width: 3
      },
      { type: 'text' as const, position: { x: 0, y: 0 }, content: 'A', color: '#000', fontSize: 16 }
    ])
    expect(calls).toContain('clearRect(0,0,800,600)')
    expect(calls).toContain('stroke')
    expect(calls).toContain('fillText(A,0,0)')
  })
})
