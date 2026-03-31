import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEditorActions } from '@/hooks/use-editor-actions'

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

describe('useEditorActions', () => {
  const mockRef = { current: null }

  beforeEach(() => {
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return createMockCanvas()
      return origCreateElement(tag)
    }) as typeof document.createElement)
  })

  it('starts with showDiscardDialog false', () => {
    const { result } = renderHook(() =>
      useEditorActions({
        width: 800,
        height: 600,
        scaleFactor: 1,
        compositeCanvasRef: mockRef,
        annotationsCount: 0
      })
    )
    expect(result.current.showDiscardDialog).toBe(false)
  })

  it('handleCopy composites and copies with valid canvas ref', () => {
    const compositeCanvas = createMockCanvas()
    const { result } = renderHook(() =>
      useEditorActions({
        width: 800,
        height: 600,
        scaleFactor: 1,
        compositeCanvasRef: { current: compositeCanvas },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleCopy()
    })
    expect(window.api.editor.copy).toHaveBeenCalledWith('data:image/png;base64,mockdata')
  })

  it('handleSave composites and saves with valid canvas ref', () => {
    const compositeCanvas = createMockCanvas()
    const { result } = renderHook(() =>
      useEditorActions({
        width: 800,
        height: 600,
        scaleFactor: 1,
        compositeCanvasRef: { current: compositeCanvas },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleSave()
    })
    expect(window.api.editor.save).toHaveBeenCalledWith('data:image/png;base64,mockdata')
  })

  it('handleCopy draws annotation canvas when present', () => {
    const compositeCanvas = createMockCanvas()
    const annotationCanvas = document.createElement('canvas')
    annotationCanvas.id = 'annotation-canvas'
    annotationCanvas.width = 200
    annotationCanvas.height = 200
    document.body.appendChild(annotationCanvas)

    const { result } = renderHook(() =>
      useEditorActions({
        width: 800,
        height: 600,
        scaleFactor: 1,
        compositeCanvasRef: { current: compositeCanvas },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleCopy()
    })
    expect(window.api.editor.copy).toHaveBeenCalled()
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
      useEditorActions({
        width: 800,
        height: 600,
        scaleFactor: 1,
        compositeCanvasRef: { current: compositeCanvas },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleCopy()
    })
    expect(window.api.editor.copy).not.toHaveBeenCalled()
  })

  it('handleCancel calls api directly with no annotations', () => {
    const { result } = renderHook(() =>
      useEditorActions({
        width: 800,
        height: 600,
        scaleFactor: 1,
        compositeCanvasRef: mockRef,
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleCancel()
    })
    expect(window.api.editor.cancel).toHaveBeenCalled()
  })

  it('handleCancel shows discard dialog with annotations', () => {
    const { result } = renderHook(() =>
      useEditorActions({
        width: 800,
        height: 600,
        scaleFactor: 1,
        compositeCanvasRef: mockRef,
        annotationsCount: 5
      })
    )
    act(() => {
      result.current.handleCancel()
    })
    expect(result.current.showDiscardDialog).toBe(true)
    expect(window.api.editor.cancel).not.toHaveBeenCalled()
  })

  it('handleConfirmDiscard hides dialog and calls cancel', () => {
    const { result } = renderHook(() =>
      useEditorActions({
        width: 800,
        height: 600,
        scaleFactor: 1,
        compositeCanvasRef: mockRef,
        annotationsCount: 5
      })
    )
    act(() => {
      result.current.handleCancel()
    })
    act(() => {
      result.current.handleConfirmDiscard()
    })
    expect(result.current.showDiscardDialog).toBe(false)
    expect(window.api.editor.cancel).toHaveBeenCalled()
  })

  it('handleDismissDiscard hides dialog without cancel', () => {
    const { result } = renderHook(() =>
      useEditorActions({
        width: 800,
        height: 600,
        scaleFactor: 1,
        compositeCanvasRef: mockRef,
        annotationsCount: 5
      })
    )
    act(() => {
      result.current.handleCancel()
    })
    act(() => {
      result.current.handleDismissDiscard()
    })
    expect(result.current.showDiscardDialog).toBe(false)
    expect(window.api.editor.cancel).not.toHaveBeenCalled()
  })

  it('handleCopy does nothing without composite canvas', () => {
    const { result } = renderHook(() =>
      useEditorActions({
        width: 800,
        height: 600,
        scaleFactor: 1,
        compositeCanvasRef: { current: null },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleCopy()
    })
    expect(window.api.editor.copy).not.toHaveBeenCalled()
  })

  it('handleSave does nothing without composite canvas', () => {
    const { result } = renderHook(() =>
      useEditorActions({
        width: 800,
        height: 600,
        scaleFactor: 1,
        compositeCanvasRef: { current: null },
        annotationsCount: 0
      })
    )
    act(() => {
      result.current.handleSave()
    })
    expect(window.api.editor.save).not.toHaveBeenCalled()
  })
})
