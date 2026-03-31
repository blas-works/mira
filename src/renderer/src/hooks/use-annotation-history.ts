import { useState, useCallback, useEffect } from 'react'
import type { Annotation } from '@shared/types'

interface HistoryState {
  annotations: Annotation[]
  undone: Annotation[]
}

interface UseAnnotationHistoryReturn {
  annotations: Annotation[]
  canUndo: boolean
  canRedo: boolean
  addAnnotation: (item: Annotation) => void
  undo: () => void
  redo: () => void
}

export function useAnnotationHistory(
  onAnnotationsChange?: (count: number) => void,
  onUndoStateChange?: (canUndo: boolean, canRedo: boolean) => void
): UseAnnotationHistoryReturn {
  const [history, setHistory] = useState<HistoryState>({ annotations: [], undone: [] })

  const { annotations, undone } = history
  const canUndo = annotations.length > 0
  const canRedo = undone.length > 0

  const addAnnotation = useCallback((item: Annotation) => {
    setHistory((prev) => ({
      annotations: [...prev.annotations, item],
      undone: []
    }))
  }, [])

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.annotations.length === 0) return prev
      const last = prev.annotations[prev.annotations.length - 1]
      return {
        annotations: prev.annotations.slice(0, -1),
        undone: [...prev.undone, last]
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.undone.length === 0) return prev
      const last = prev.undone[prev.undone.length - 1]
      return {
        annotations: [...prev.annotations, last],
        undone: prev.undone.slice(0, -1)
      }
    })
  }, [])

  useEffect(() => {
    onAnnotationsChange?.(annotations.length)
    onUndoStateChange?.(annotations.length > 0, undone.length > 0)
  }, [annotations.length, undone.length, onAnnotationsChange, onUndoStateChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return { annotations, canUndo, canRedo, addAnnotation, undo, redo }
}
