import { useState, useCallback, useRef, type MouseEvent } from 'react'
import type { SelectionRect } from '@shared/types'

type SelectionPhase = 'idle' | 'selecting' | 'selected' | 'moving' | 'resizing'
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface UseSelectionReturn {
  phase: SelectionPhase
  selection: SelectionRect | null
  activeHandle: ResizeHandle | null
  onMouseDown: (e: MouseEvent) => void
  onMouseMove: (e: MouseEvent) => void
  onMouseUp: () => void
  onHandleMouseDown: (handle: ResizeHandle, e: MouseEvent) => void
  onSelectionMouseDown: (e: MouseEvent) => void
  forceSelection: (rect: SelectionRect) => void
}

function normalizeRect(x1: number, y1: number, x2: number, y2: number): SelectionRect {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1)
  }
}

export function useSelection(): UseSelectionReturn {
  const [phase, setPhase] = useState<SelectionPhase>('idle')
  const [selection, setSelection] = useState<SelectionRect | null>(null)
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null)

  const startRef = useRef({ x: 0, y: 0 })
  const dragStartRef = useRef({ x: 0, y: 0 })
  const originalSelRef = useRef<SelectionRect | null>(null)

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      if (phase !== 'idle') return
      startRef.current = { x: e.clientX, y: e.clientY }
      setPhase('selecting')
      setSelection({ x: e.clientX, y: e.clientY, width: 0, height: 0 })
    },
    [phase]
  )

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (phase === 'selecting') {
        const rect = normalizeRect(startRef.current.x, startRef.current.y, e.clientX, e.clientY)
        setSelection(rect)
      } else if (phase === 'moving' && originalSelRef.current) {
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y
        setSelection({
          ...originalSelRef.current,
          x: originalSelRef.current.x + dx,
          y: originalSelRef.current.y + dy
        })
      } else if (phase === 'resizing' && activeHandle && originalSelRef.current) {
        const sel = originalSelRef.current
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y

        let { x, y, width, height } = sel

        if (activeHandle.includes('w')) {
          x = sel.x + dx
          width = sel.width - dx
        }
        if (activeHandle.includes('e')) {
          width = sel.width + dx
        }
        if (activeHandle.includes('n')) {
          y = sel.y + dy
          height = sel.height - dy
        }
        if (activeHandle.includes('s')) {
          height = sel.height + dy
        }

        if (width < 10) width = 10
        if (height < 10) height = 10

        setSelection({ x, y, width, height })
      }
    },
    [phase, activeHandle]
  )

  const onMouseUp = useCallback(() => {
    if (phase === 'selecting') {
      if (selection && selection.width > 5 && selection.height > 5) {
        setPhase('selected')
      } else {
        setPhase('idle')
        setSelection(null)
      }
    } else if (phase === 'moving' || phase === 'resizing') {
      setPhase('selected')
      setActiveHandle(null)
    }
  }, [phase, selection])

  const onHandleMouseDown = useCallback(
    (handle: ResizeHandle, e: MouseEvent) => {
      e.stopPropagation()
      setPhase('resizing')
      setActiveHandle(handle)
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      originalSelRef.current = selection
    },
    [selection]
  )

  const onSelectionMouseDown = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      setPhase('moving')
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      originalSelRef.current = selection
    },
    [selection]
  )

  const forceSelection = useCallback((rect: SelectionRect) => {
    setSelection(rect)
    setPhase('selected')
    setActiveHandle(null)
  }, [])

  return {
    phase,
    selection,
    activeHandle,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onHandleMouseDown,
    onSelectionMouseDown,
    forceSelection
  }
}
