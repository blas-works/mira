import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useToolbarPosition } from '@/hooks/use-toolbar-position'
import type { SelectionRect } from '@shared/types'

function setViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  })
}

describe('useToolbarPosition', () => {
  beforeEach(() => {
    setViewport(1920, 1080)
  })

  it('returns default positions with null selection', () => {
    const { result } = renderHook(() => useToolbarPosition(null))
    expect(result.current.annotationToolbarPos).toEqual({ x: 0, y: 0 })
    expect(result.current.actionToolbarPos).toEqual({ x: 0, y: 0 })
  })

  it('places annotation toolbar right of selection when space available', () => {
    const selection: SelectionRect = { x: 100, y: 100, width: 200, height: 200 }
    const { result } = renderHook(() => useToolbarPosition(selection))
    expect(result.current.annotationToolbarPos.x).toBe(306)
    expect(result.current.annotationToolbarPos.y).toBe(100)
  })

  it('places annotation toolbar left of selection when no right space', () => {
    setViewport(300, 1080)
    const selection: SelectionRect = { x: 100, y: 100, width: 200, height: 200 }
    const { result } = renderHook(() => useToolbarPosition(selection))
    expect(result.current.annotationToolbarPos.x).toBe(58)
  })

  it('places action toolbar below selection when space available', () => {
    const selection: SelectionRect = { x: 100, y: 100, width: 200, height: 200 }
    const { result } = renderHook(() => useToolbarPosition(selection))
    expect(result.current.actionToolbarPos.y).toBe(306)
  })

  it('places action toolbar above selection when no bottom space', () => {
    setViewport(1920, 300)
    const selection: SelectionRect = { x: 100, y: 100, width: 200, height: 200 }
    const { result } = renderHook(() => useToolbarPosition(selection))
    expect(result.current.actionToolbarPos.y).toBe(58)
  })

  it('clamps position to viewport bounds', () => {
    setViewport(100, 100)
    const selection: SelectionRect = { x: 0, y: 0, width: 50, height: 50 }
    const { result } = renderHook(() => useToolbarPosition(selection))
    expect(result.current.annotationToolbarPos.x).toBeGreaterThanOrEqual(4)
    expect(result.current.annotationToolbarPos.y).toBeGreaterThanOrEqual(4)
  })
})
