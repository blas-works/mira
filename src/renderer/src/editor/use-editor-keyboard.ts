import { useEffect } from 'react'
import type { AnnotationTool } from '@shared/types'

interface UseEditorKeyboardParams {
  activeTool: AnnotationTool
  setActiveTool: (tool: AnnotationTool) => void
  handleCopy: () => void
  handleSave: () => void
  handleCancel: () => void
}

const TOOL_KEY_MAP: Record<string, AnnotationTool> = {
  v: 'select',
  p: 'pen',
  a: 'arrow',
  r: 'rect',
  t: 'text',
  b: 'blur',
  i: 'eyedropper'
}

export function useEditorKeyboard({
  activeTool,
  setActiveTool,
  handleCopy,
  handleSave,
  handleCancel
}: UseEditorKeyboardParams): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const isTyping = document.activeElement?.tagName === 'TEXTAREA'
      if (isTyping) return

      if (e.key === 'Escape') {
        handleCancel()
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault()
        handleCopy()
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
        return
      }

      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const tool = TOOL_KEY_MAP[e.key.toLowerCase()]
        if (tool && activeTool !== tool) {
          setActiveTool(tool)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCopy, handleSave, handleCancel, activeTool, setActiveTool])
}
