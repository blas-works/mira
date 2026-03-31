import { describe, it, expect, beforeEach } from 'vitest'
import { createToolHandlers, type ToolHandler } from '@/lib/annotation-tools'
import type {
  AnnotationTool,
  PenStroke,
  ArrowAnnotation,
  RectAnnotation,
  BlurAnnotation
} from '@shared/types'

describe('createToolHandlers', () => {
  let handlers: Record<AnnotationTool, ToolHandler>

  beforeEach(() => {
    handlers = createToolHandlers()
  })

  it('returns handlers for all 7 tools', () => {
    const keys = Object.keys(handlers)
    expect(keys).toHaveLength(7)
    expect(keys).toContain('select')
    expect(keys).toContain('pen')
    expect(keys).toContain('arrow')
    expect(keys).toContain('rect')
    expect(keys).toContain('text')
    expect(keys).toContain('blur')
    expect(keys).toContain('eyedropper')
  })

  describe('SelectToolHandler', () => {
    it('returns null from all mouse events', () => {
      const h = handlers.select
      h.onMouseDown({ x: 0, y: 0 }, '#fff')
      expect(h.onMouseMove({ x: 10, y: 10 }, '#fff')).toBeNull()
      expect(h.onMouseUp({ x: 10, y: 10 }, '#fff')).toBeNull()
    })

    it('has no special flags', () => {
      expect(handlers.select.isTextTool).toBeUndefined()
      expect(handlers.select.isEyedropperTool).toBeUndefined()
    })
  })

  describe('PenToolHandler', () => {
    it('returns null on mouseMove without mouseDown', () => {
      expect(handlers.pen.onMouseMove({ x: 5, y: 5 }, '#fff')).toBeNull()
    })

    it('returns null on mouseUp without mouseDown', () => {
      expect(handlers.pen.onMouseUp({ x: 5, y: 5 }, '#fff')).toBeNull()
    })

    it('returns preview annotation during draw', () => {
      handlers.pen.onMouseDown({ x: 0, y: 0 }, '#f00')
      const result = handlers.pen.onMouseMove({ x: 10, y: 10 }, '#f00')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('pen')
      const pen = result as unknown as PenStroke
      expect(pen.color).toBe('#f00')
      expect(pen.points).toHaveLength(2)
      expect(pen.width).toBe(3)
    })

    it('returns null on mouseUp with single point', () => {
      handlers.pen.onMouseDown({ x: 0, y: 0 }, '#f00')
      expect(handlers.pen.onMouseUp({ x: 0, y: 0 }, '#f00')).toBeNull()
    })

    it('returns annotation on mouseUp with multiple points', () => {
      handlers.pen.onMouseDown({ x: 0, y: 0 }, '#f00')
      handlers.pen.onMouseMove({ x: 10, y: 10 }, '#f00')
      const result = handlers.pen.onMouseUp({ x: 20, y: 20 }, '#f00')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('pen')
      expect((result as unknown as PenStroke).points.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('reset clears drawing state', () => {
    handlers.pen.onMouseDown({ x: 0, y: 0 }, '#f00')
    handlers.pen.reset()
    expect(handlers.pen.onMouseMove({ x: 10, y: 10 }, '#f00')).toBeNull()
  })

  describe('ArrowToolHandler', () => {
    it('returns null on mouseMove without mouseDown', () => {
      expect(handlers.arrow.onMouseMove({ x: 5, y: 5 }, '#f00')).toBeNull()
    })

    it('returns preview during draw', () => {
      handlers.arrow.onMouseDown({ x: 0, y: 0 }, '#f00')
      const result = handlers.arrow.onMouseMove({ x: 50, y: 50 }, '#f00')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('arrow')
      const arrow = result as unknown as ArrowAnnotation
      expect(arrow.start).toEqual({ x: 0, y: 0 })
      expect(arrow.end).toEqual({ x: 50, y: 50 })
      expect(arrow.width).toBe(3)
    })

    it('returns annotation on mouseUp', () => {
      handlers.arrow.onMouseDown({ x: 0, y: 0 }, '#f00')
      const result = handlers.arrow.onMouseUp({ x: 100, y: 100 }, '#f00')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('arrow')
    })

    it('reset clears state', () => {
      handlers.arrow.onMouseDown({ x: 0, y: 0 }, '#f00')
      handlers.arrow.reset()
      expect(handlers.arrow.onMouseMove({ x: 10, y: 10 }, '#f00')).toBeNull()
    })
  })

  describe('RectToolHandler', () => {
    it('returns preview during draw', () => {
      handlers.rect.onMouseDown({ x: 0, y: 0 }, '#f00')
      const result = handlers.rect.onMouseMove({ x: 50, y: 50 }, '#f00')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('rect')
      expect((result as unknown as RectAnnotation).width).toBe(2)
    })

    it('returns annotation on mouseUp', () => {
      handlers.rect.onMouseDown({ x: 0, y: 0 }, '#00f')
      const result = handlers.rect.onMouseUp({ x: 50, y: 50 }, '#00f')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('rect')
    })

    it('reset clears state', () => {
      handlers.rect.onMouseDown({ x: 0, y: 0 }, '#f00')
      handlers.rect.reset()
      expect(handlers.rect.onMouseMove({ x: 10, y: 10 }, '#f00')).toBeNull()
    })
  })

  describe('TextToolHandler', () => {
    it('has isTextTool flag', () => {
      expect(handlers.text.isTextTool).toBe(true)
    })

    it('returns null from all mouse events', () => {
      const h = handlers.text
      h.onMouseDown({ x: 0, y: 0 }, '#fff')
      expect(h.onMouseMove({ x: 10, y: 10 }, '#fff')).toBeNull()
      expect(h.onMouseUp({ x: 10, y: 10 }, '#fff')).toBeNull()
    })
  })

  describe('BlurToolHandler', () => {
    it('returns null on mouseMove without mouseDown', () => {
      expect(handlers.blur.onMouseMove({ x: 5, y: 5 }, '#fff')).toBeNull()
    })

    it('returns preview during draw', () => {
      handlers.blur.onMouseDown({ x: 0, y: 0 }, '#fff')
      const result = handlers.blur.onMouseMove({ x: 50, y: 50 }, '#fff')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('blur')
    })

    it('returns null on mouseUp when area too small', () => {
      handlers.blur.onMouseDown({ x: 0, y: 0 }, '#fff')
      const result = handlers.blur.onMouseUp({ x: 2, y: 2 }, '#fff')
      expect(result).toBeNull()
    })

    it('returns annotation on mouseUp with sufficient area', () => {
      handlers.blur.onMouseDown({ x: 0, y: 0 }, '#fff')
      const result = handlers.blur.onMouseUp({ x: 50, y: 50 }, '#fff')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('blur')
      const blur = result as unknown as BlurAnnotation
      expect(blur.start).toEqual({ x: 0, y: 0 })
      expect(blur.end).toEqual({ x: 50, y: 50 })
    })

    it('reset clears state', () => {
      handlers.blur.onMouseDown({ x: 0, y: 0 }, '#fff')
      handlers.blur.reset()
      expect(handlers.blur.onMouseMove({ x: 10, y: 10 }, '#fff')).toBeNull()
    })
  })

  describe('EyedropperToolHandler', () => {
    it('has isEyedropperTool flag', () => {
      expect(handlers.eyedropper.isEyedropperTool).toBe(true)
    })

    it('returns null from all mouse events', () => {
      const h = handlers.eyedropper
      h.onMouseDown({ x: 0, y: 0 }, '#fff')
      expect(h.onMouseMove({ x: 10, y: 10 }, '#fff')).toBeNull()
      expect(h.onMouseUp({ x: 10, y: 10 }, '#fff')).toBeNull()
    })
  })
})
