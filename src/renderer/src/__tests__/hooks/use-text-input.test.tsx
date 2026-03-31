import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTextInput } from '@/hooks/use-text-input'
import type { Annotation } from '@shared/types'

describe('useTextInput', () => {
  it('starts with hidden text input', () => {
    const { result } = renderHook(() => useTextInput())
    expect(result.current.textInput.visible).toBe(false)
    expect(result.current.textInput.value).toBe('')
  })

  it('openTextInput sets visible with coordinates', () => {
    const { result } = renderHook(() => useTextInput())
    act(() => {
      result.current.openTextInput(100, 200)
    })
    expect(result.current.textInput.visible).toBe(true)
    expect(result.current.textInput.x).toBe(100)
    expect(result.current.textInput.y).toBe(200)
    expect(result.current.textInput.value).toBe('')
  })

  it('confirmText returns null when value is empty', () => {
    const { result } = renderHook(() => useTextInput())
    act(() => {
      result.current.openTextInput(10, 20)
    })
    act(() => {
      result.current.updateTextValue('   ')
    })
    let annotation: ReturnType<typeof result.current.confirmText> = null
    act(() => {
      annotation = result.current.confirmText('#f00', 16)
    })
    expect(annotation).toBeNull()
    expect(result.current.textInput.visible).toBe(false)
  })

  it('confirmText returns text annotation with valid content', () => {
    const { result } = renderHook(() => useTextInput())
    act(() => {
      result.current.openTextInput(10, 20)
    })
    act(() => {
      result.current.updateTextValue('Hello World')
    })
    let annotation: Annotation | null = null
    act(() => {
      annotation = result.current.confirmText('#f00', 16)
    })
    expect(annotation).not.toBeNull()
    const text = annotation as unknown as Extract<Annotation, { type: 'text' }>
    expect(text.type).toBe('text')
    expect(text.position).toEqual({ x: 10, y: 20 })
    expect(text.content).toBe('Hello World')
    expect(text.color).toBe('#f00')
    expect(text.fontSize).toBe(16)
    expect(result.current.textInput.visible).toBe(false)
  })

  it('cancelText hides input without creating annotation', () => {
    const { result } = renderHook(() => useTextInput())
    act(() => {
      result.current.openTextInput(10, 20)
    })
    act(() => {
      result.current.updateTextValue('Some text')
    })
    act(() => {
      result.current.cancelText()
    })
    expect(result.current.textInput.visible).toBe(false)
    expect(result.current.textInput.value).toBe('')
  })

  it('updateTextValue updates the value', () => {
    const { result } = renderHook(() => useTextInput())
    act(() => {
      result.current.openTextInput(0, 0)
    })
    act(() => {
      result.current.updateTextValue('typed text')
    })
    expect(result.current.textInput.value).toBe('typed text')
  })

  it('handleTextKeyDown returns annotation on Enter', () => {
    const { result } = renderHook(() => useTextInput())
    act(() => {
      result.current.openTextInput(10, 20)
    })
    act(() => {
      result.current.updateTextValue('Hello')
    })
    let annotation: Annotation | null = null
    act(() => {
      annotation = result.current.handleTextKeyDown(
        {
          key: 'Enter',
          shiftKey: false,
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent,
        '#f00',
        16
      )
    })
    expect(annotation).not.toBeNull()
    expect(annotation!.type).toBe('text')
  })

  it('handleTextKeyDown does not confirm on Shift+Enter', () => {
    const { result } = renderHook(() => useTextInput())
    act(() => {
      result.current.openTextInput(10, 20)
    })
    act(() => {
      result.current.updateTextValue('Hello')
    })
    let annotation: Annotation | null = null
    act(() => {
      annotation = result.current.handleTextKeyDown(
        {
          key: 'Enter',
          shiftKey: true,
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent,
        '#f00',
        16
      )
    })
    expect(annotation).toBeNull()
    expect(result.current.textInput.visible).toBe(true)
  })

  it('handleTextKeyDown cancels on Escape', () => {
    const { result } = renderHook(() => useTextInput())
    act(() => {
      result.current.openTextInput(10, 20)
    })
    act(() => {
      result.current.updateTextValue('Hello')
    })
    act(() => {
      result.current.handleTextKeyDown(
        {
          key: 'Escape',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent,
        '#f00',
        16
      )
    })
    expect(result.current.textInput.visible).toBe(false)
  })
})
