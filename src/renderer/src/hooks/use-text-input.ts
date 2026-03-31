import { useState, useCallback, useEffect, useRef } from 'react'
import type { Annotation } from '@shared/types'

interface TextInputState {
  visible: boolean
  x: number
  y: number
  value: string
}

const INITIAL_STATE: TextInputState = { visible: false, x: 0, y: 0, value: '' }

interface UseTextInputReturn {
  textInput: TextInputState
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  openTextInput: (x: number, y: number) => void
  confirmText: (color: string, fontSize: number) => Annotation | null
  cancelText: () => void
  handleTextKeyDown: (e: React.KeyboardEvent, color: string, fontSize: number) => Annotation | null
  updateTextValue: (value: string) => void
}

export function useTextInput(): UseTextInputReturn {
  const [textInput, setTextInput] = useState<TextInputState>(INITIAL_STATE)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textInput.visible) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
      })
    }
  }, [textInput.visible])

  const openTextInput = useCallback((x: number, y: number) => {
    setTextInput({ visible: true, x, y, value: '' })
  }, [])

  const confirmText = useCallback(
    (color: string, fontSize: number): Annotation | null => {
      if (textInput.value.trim()) {
        const annotation: Annotation = {
          type: 'text',
          position: { x: textInput.x, y: textInput.y },
          content: textInput.value,
          color,
          fontSize
        }
        setTextInput(INITIAL_STATE)
        return annotation
      }
      setTextInput(INITIAL_STATE)
      return null
    },
    [textInput]
  )

  const cancelText = useCallback(() => {
    setTextInput(INITIAL_STATE)
  }, [])

  const handleTextKeyDown = useCallback(
    (e: React.KeyboardEvent, color: string, fontSize: number) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const annotation = confirmText(color, fontSize)
        if (annotation) return annotation
      } else if (e.key === 'Escape') {
        cancelText()
      }
      e.stopPropagation()
      return null
    },
    [confirmText, cancelText]
  )

  const updateTextValue = useCallback((value: string) => {
    setTextInput((prev) => ({ ...prev, value }))
  }, [])

  return {
    textInput,
    textareaRef,
    openTextInput,
    confirmText,
    cancelText,
    handleTextKeyDown,
    updateTextValue
  }
}
