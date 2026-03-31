import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnnotationHistory } from '@/hooks/use-annotation-history'
import type { Annotation } from '@shared/types'

const penAnnotation: Annotation = {
  type: 'pen',
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 10 }
  ],
  color: '#f00',
  width: 3
}

const arrowAnnotation: Annotation = {
  type: 'arrow',
  start: { x: 0, y: 0 },
  end: { x: 50, y: 50 },
  color: '#00f',
  width: 3
}

describe('useAnnotationHistory', () => {
  it('starts with empty annotations', () => {
    const { result } = renderHook(() => useAnnotationHistory())
    expect(result.current.annotations).toHaveLength(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('adds an annotation', () => {
    const { result } = renderHook(() => useAnnotationHistory())
    act(() => {
      result.current.addAnnotation(penAnnotation)
    })
    expect(result.current.annotations).toHaveLength(1)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('undoes an annotation', () => {
    const { result } = renderHook(() => useAnnotationHistory())
    act(() => {
      result.current.addAnnotation(penAnnotation)
    })
    act(() => {
      result.current.undo()
    })
    expect(result.current.annotations).toHaveLength(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('redoes an undone annotation', () => {
    const { result } = renderHook(() => useAnnotationHistory())
    act(() => {
      result.current.addAnnotation(penAnnotation)
    })
    act(() => {
      result.current.undo()
    })
    act(() => {
      result.current.redo()
    })
    expect(result.current.annotations).toHaveLength(1)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('clears redo stack on new annotation after undo', () => {
    const { result } = renderHook(() => useAnnotationHistory())
    act(() => {
      result.current.addAnnotation(penAnnotation)
    })
    act(() => {
      result.current.undo()
    })
    act(() => {
      result.current.addAnnotation(arrowAnnotation)
    })
    expect(result.current.annotations).toHaveLength(1)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.annotations[0]).toEqual(arrowAnnotation)
  })

  it('undo on empty state does nothing', () => {
    const { result } = renderHook(() => useAnnotationHistory())
    act(() => {
      result.current.undo()
    })
    expect(result.current.annotations).toHaveLength(0)
  })

  it('redo on empty redo stack does nothing', () => {
    const { result } = renderHook(() => useAnnotationHistory())
    act(() => {
      result.current.redo()
    })
    expect(result.current.annotations).toHaveLength(0)
  })

  it('calls onAnnotationsChange callback', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useAnnotationHistory(onChange))
    act(() => {
      result.current.addAnnotation(penAnnotation)
    })
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('calls onUndoStateChange callback', () => {
    const onUndoState = vi.fn()
    const { result } = renderHook(() => useAnnotationHistory(undefined, onUndoState))
    act(() => {
      result.current.addAnnotation(penAnnotation)
    })
    expect(onUndoState).toHaveBeenCalledWith(true, false)
  })

  it('handles Ctrl+Z keyboard undo', () => {
    const { result } = renderHook(() => useAnnotationHistory())
    act(() => {
      result.current.addAnnotation(penAnnotation)
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }))
    })
    expect(result.current.annotations).toHaveLength(0)
    expect(result.current.canRedo).toBe(true)
  })

  it('handles Ctrl+Shift+Z keyboard redo', () => {
    const { result } = renderHook(() => useAnnotationHistory())
    act(() => {
      result.current.addAnnotation(penAnnotation)
    })
    act(() => {
      result.current.undo()
    })
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true })
      )
    })
    expect(result.current.annotations).toHaveLength(1)
  })

  it('handles Ctrl+Y keyboard redo', () => {
    const { result } = renderHook(() => useAnnotationHistory())
    act(() => {
      result.current.addAnnotation(penAnnotation)
    })
    act(() => {
      result.current.undo()
    })
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true }))
    })
    expect(result.current.annotations).toHaveLength(1)
  })

  it('supports multiple annotations', () => {
    const { result } = renderHook(() => useAnnotationHistory())
    act(() => {
      result.current.addAnnotation(penAnnotation)
      result.current.addAnnotation(arrowAnnotation)
    })
    expect(result.current.annotations).toHaveLength(2)
    act(() => {
      result.current.undo()
    })
    expect(result.current.annotations).toHaveLength(1)
    expect(result.current.annotations[0]).toEqual(penAnnotation)
  })
})
