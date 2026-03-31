import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCaptureActions } from '@/hooks/use-capture-actions'
import type { CaptureData, SelectionRect } from '@shared/types'

const mockSelection: SelectionRect = { x: 10, y: 10, width: 100, height: 100 }
const mockCaptureData: CaptureData = {
  displays: [
    {
      imageDataURL: 'data:image/png;base64,test',
      bounds: { x: 0, y: 0, width: 1920, height: 1080, scaleFactor: 1 }
    }
  ],
  virtualBounds: { x: 0, y: 0, width: 1920, height: 1080, scaleFactor: 1 }
}

const origCreateElement = document.createElement.bind(document)

function createMockCanvas(): HTMLCanvasElement {
  const mockCtx = {
    drawImage: vi.fn()
  }
  const canvas = origCreateElement('canvas')
  vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)
  canvas.toDataURL = vi.fn(() => 'data:image/png;base64,mockdata')
  return canvas
}

describe('useCaptureActions', () => {
  beforeEach(() => {
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return createMockCanvas()
      return origCreateElement(tag)
    }) as typeof document.createElement)
  })

  it('starts with showDiscardDialog false', () => {
    const { result } = renderHook(() =>
      useCaptureActions({
        selection: null,
        captureData: null,
        compositeCanvasRef: { current: null },
        annotationsCount: 0
      })
    )
    expect(result.current.showDiscardDialog).toBe(false)
  })

  it('handleCopy does nothing without selection', () => {
    const { result } = renderHook(() =>
      useCaptureActions({
        selection: null,
        captureData: mockCaptureData,
        compositeCanvasRef: { current: null },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleCopy()
    })
    expect(window.api.capture.copy).not.toHaveBeenCalled()
  })

  it('handleCopy does nothing without captureData', () => {
    const { result } = renderHook(() =>
      useCaptureActions({
        selection: mockSelection,
        captureData: null,
        compositeCanvasRef: { current: null },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleCopy()
    })
    expect(window.api.capture.copy).not.toHaveBeenCalled()
  })

  it('handleCopy composites and copies with valid selection, data, and canvas', () => {
    const compositeCanvas = createMockCanvas()
    const { result } = renderHook(() =>
      useCaptureActions({
        selection: mockSelection,
        captureData: mockCaptureData,
        compositeCanvasRef: { current: compositeCanvas },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleCopy()
    })
    expect(window.api.capture.copy).toHaveBeenCalledWith('data:image/png;base64,mockdata')
  })

  it('handleSave does nothing without selection', () => {
    const { result } = renderHook(() =>
      useCaptureActions({
        selection: null,
        captureData: mockCaptureData,
        compositeCanvasRef: { current: null },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleSave()
    })
    expect(window.api.capture.save).not.toHaveBeenCalled()
  })

  it('handleSave composites and saves with valid data', () => {
    const compositeCanvas = createMockCanvas()
    const { result } = renderHook(() =>
      useCaptureActions({
        selection: mockSelection,
        captureData: mockCaptureData,
        compositeCanvasRef: { current: compositeCanvas },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleSave()
    })
    expect(window.api.capture.save).toHaveBeenCalledWith('data:image/png;base64,mockdata')
  })

  it('handleCopy draws annotation canvas when present', () => {
    const compositeCanvas = createMockCanvas()
    const annotationCanvas = document.createElement('canvas')
    annotationCanvas.id = 'annotation-canvas'
    annotationCanvas.width = 200
    annotationCanvas.height = 200
    document.body.appendChild(annotationCanvas)

    const { result } = renderHook(() =>
      useCaptureActions({
        selection: mockSelection,
        captureData: mockCaptureData,
        compositeCanvasRef: { current: compositeCanvas },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleCopy()
    })
    expect(window.api.capture.copy).toHaveBeenCalled()
    document.body.removeChild(annotationCanvas)
  })

  it('handleCopy returns null when getContext returns null', () => {
    const compositeCanvas = origCreateElement('canvas')
    vi.spyOn(compositeCanvas, 'getContext').mockReturnValue(null)

    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') {
        const c = origCreateElement('canvas')
        vi.spyOn(c, 'getContext').mockReturnValue(null)
        return c
      }
      return origCreateElement(tag)
    }) as typeof document.createElement)

    const { result } = renderHook(() =>
      useCaptureActions({
        selection: mockSelection,
        captureData: mockCaptureData,
        compositeCanvasRef: { current: compositeCanvas },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleCopy()
    })
    expect(window.api.capture.copy).not.toHaveBeenCalled()
  })

  it('handleCancel calls api directly with no annotations', () => {
    const { result } = renderHook(() =>
      useCaptureActions({
        selection: null,
        captureData: null,
        compositeCanvasRef: { current: null },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleCancel()
    })
    expect(window.api.capture.cancel).toHaveBeenCalled()
    expect(result.current.showDiscardDialog).toBe(false)
  })

  it('handleCancel shows discard dialog with annotations', () => {
    const { result } = renderHook(() =>
      useCaptureActions({
        selection: null,
        captureData: null,
        compositeCanvasRef: { current: null },
        annotationsCount: 3
      })
    )
    act(() => {
      result.current.handleCancel()
    })
    expect(result.current.showDiscardDialog).toBe(true)
    expect(window.api.capture.cancel).not.toHaveBeenCalled()
  })

  it('handleConfirmDiscard hides dialog and calls cancel', () => {
    const { result } = renderHook(() =>
      useCaptureActions({
        selection: null,
        captureData: null,
        compositeCanvasRef: { current: null },
        annotationsCount: 3
      })
    )
    act(() => {
      result.current.handleCancel()
    })
    act(() => {
      result.current.handleConfirmDiscard()
    })
    expect(result.current.showDiscardDialog).toBe(false)
    expect(window.api.capture.cancel).toHaveBeenCalled()
  })

  it('handleDismissDiscard hides dialog', () => {
    const { result } = renderHook(() =>
      useCaptureActions({
        selection: null,
        captureData: null,
        compositeCanvasRef: { current: null },
        annotationsCount: 3
      })
    )
    act(() => {
      result.current.handleCancel()
    })
    act(() => {
      result.current.handleDismissDiscard()
    })
    expect(result.current.showDiscardDialog).toBe(false)
    expect(window.api.capture.cancel).not.toHaveBeenCalled()
  })
})
