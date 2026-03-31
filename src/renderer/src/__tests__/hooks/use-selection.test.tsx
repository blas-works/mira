import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelection } from '@/hooks/use-selection'
import type { MouseEvent as ReactMouseEvent } from 'react'

describe('useSelection', () => {
  it('starts in idle phase with no selection', () => {
    const { result } = renderHook(() => useSelection())
    expect(result.current.phase).toBe('idle')
    expect(result.current.selection).toBeNull()
    expect(result.current.activeHandle).toBeNull()
  })

  it('transitions to selecting on mouseDown', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.onMouseDown({ clientX: 10, clientY: 20 } as unknown as ReactMouseEvent)
    })
    expect(result.current.phase).toBe('selecting')
    expect(result.current.selection).toEqual({ x: 10, y: 20, width: 0, height: 0 })
  })

  it('updates selection during selecting phase', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.onMouseDown({ clientX: 10, clientY: 10 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseMove({ clientX: 50, clientY: 60 } as unknown as ReactMouseEvent)
    })
    expect(result.current.selection).toEqual({ x: 10, y: 10, width: 40, height: 50 })
  })

  it('transitions to selected on mouseUp with sufficient size', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.onMouseDown({ clientX: 10, clientY: 10 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseMove({ clientX: 60, clientY: 60 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseUp()
    })
    expect(result.current.phase).toBe('selected')
    expect(result.current.selection).not.toBeNull()
  })

  it('resets to idle on mouseUp with tiny selection', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.onMouseDown({ clientX: 10, clientY: 10 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseMove({ clientX: 12, clientY: 12 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseUp()
    })
    expect(result.current.phase).toBe('idle')
    expect(result.current.selection).toBeNull()
  })

  it('ignores mouseDown when not idle', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.onMouseDown({ clientX: 10, clientY: 10 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseDown({ clientX: 100, clientY: 100 } as unknown as ReactMouseEvent)
    })
    expect(result.current.selection).toEqual({ x: 10, y: 10, width: 0, height: 0 })
  })

  it('handles moving phase', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.onMouseDown({ clientX: 10, clientY: 10 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseMove({ clientX: 60, clientY: 60 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseUp()
    })
    expect(result.current.phase).toBe('selected')
    act(() => {
      result.current.onSelectionMouseDown({
        clientX: 30,
        clientY: 30,
        stopPropagation: vi.fn()
      } as unknown as ReactMouseEvent)
    })
    expect(result.current.phase).toBe('moving')
    act(() => {
      result.current.onMouseMove({ clientX: 40, clientY: 40 } as unknown as ReactMouseEvent)
    })
    expect(result.current.selection!.x).toBe(20)
    expect(result.current.selection!.y).toBe(20)
    act(() => {
      result.current.onMouseUp()
    })
    expect(result.current.phase).toBe('selected')
  })

  it('handles resizing phase', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.onMouseDown({ clientX: 10, clientY: 10 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseMove({ clientX: 60, clientY: 60 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseUp()
    })
    act(() => {
      result.current.onHandleMouseDown('se', {
        clientX: 60,
        clientY: 60,
        stopPropagation: vi.fn()
      } as unknown as ReactMouseEvent)
    })
    expect(result.current.phase).toBe('resizing')
    expect(result.current.activeHandle).toBe('se')
    act(() => {
      result.current.onMouseMove({ clientX: 80, clientY: 80 } as unknown as ReactMouseEvent)
    })
    expect(result.current.selection!.width).toBe(70)
    expect(result.current.selection!.height).toBe(70)
    act(() => {
      result.current.onMouseUp()
    })
    expect(result.current.phase).toBe('selected')
    expect(result.current.activeHandle).toBeNull()
  })

  it('enforces minimum size during resize', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.onMouseDown({ clientX: 10, clientY: 10 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseMove({ clientX: 60, clientY: 60 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseUp()
    })
    act(() => {
      result.current.onHandleMouseDown('nw', {
        clientX: 10,
        clientY: 10,
        stopPropagation: vi.fn()
      } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseMove({ clientX: 70, clientY: 70 } as unknown as ReactMouseEvent)
    })
    expect(result.current.selection!.width).toBe(10)
    expect(result.current.selection!.height).toBe(10)
  })

  it('forceSelection sets selection directly', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.forceSelection({ x: 5, y: 5, width: 100, height: 100 })
    })
    expect(result.current.phase).toBe('selected')
    expect(result.current.selection).toEqual({ x: 5, y: 5, width: 100, height: 100 })
    expect(result.current.activeHandle).toBeNull()
  })

  it('normalizes selection rect (drag right-to-left)', () => {
    const { result } = renderHook(() => useSelection())
    act(() => {
      result.current.onMouseDown({ clientX: 50, clientY: 50 } as unknown as ReactMouseEvent)
    })
    act(() => {
      result.current.onMouseMove({ clientX: 10, clientY: 10 } as unknown as ReactMouseEvent)
    })
    expect(result.current.selection).toEqual({ x: 10, y: 10, width: 40, height: 40 })
  })
})
