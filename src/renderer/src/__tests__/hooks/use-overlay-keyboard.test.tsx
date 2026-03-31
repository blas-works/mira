import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOverlayKeyboard } from '@/hooks/use-overlay-keyboard'

describe('useOverlayKeyboard', () => {
  const mockSetActiveTool = vi.fn()
  const mockHandleCopy = vi.fn()
  const mockHandleSave = vi.fn()
  const mockHandleCancel = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('triggers handleCancel on Escape', () => {
    renderHook(() =>
      useOverlayKeyboard({
        phase: 'idle',
        activeTool: 'pen',
        setActiveTool: mockSetActiveTool,
        handleCopy: mockHandleCopy,
        handleSave: mockHandleSave,
        handleCancel: mockHandleCancel
      })
    )
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(mockHandleCancel).toHaveBeenCalled()
  })

  it('triggers handleCopy on Ctrl+C in selected phase', () => {
    renderHook(() =>
      useOverlayKeyboard({
        phase: 'selected',
        activeTool: 'pen',
        setActiveTool: mockSetActiveTool,
        handleCopy: mockHandleCopy,
        handleSave: mockHandleSave,
        handleCancel: mockHandleCancel
      })
    )
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true }))
    })
    expect(mockHandleCopy).toHaveBeenCalled()
  })

  it('does not trigger handleCopy on Ctrl+C in non-selected phase', () => {
    renderHook(() =>
      useOverlayKeyboard({
        phase: 'idle',
        activeTool: 'pen',
        setActiveTool: mockSetActiveTool,
        handleCopy: mockHandleCopy,
        handleSave: mockHandleSave,
        handleCancel: mockHandleCancel
      })
    )
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true }))
    })
    expect(mockHandleCopy).not.toHaveBeenCalled()
  })

  it('triggers handleSave on Ctrl+S in selected phase', () => {
    renderHook(() =>
      useOverlayKeyboard({
        phase: 'selected',
        activeTool: 'pen',
        setActiveTool: mockSetActiveTool,
        handleCopy: mockHandleCopy,
        handleSave: mockHandleSave,
        handleCancel: mockHandleCancel
      })
    )
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }))
    })
    expect(mockHandleSave).toHaveBeenCalled()
  })

  it('sets tool on single key press in selected phase', () => {
    renderHook(() =>
      useOverlayKeyboard({
        phase: 'selected',
        activeTool: 'select',
        setActiveTool: mockSetActiveTool,
        handleCopy: mockHandleCopy,
        handleSave: mockHandleSave,
        handleCancel: mockHandleCancel
      })
    )
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }))
    })
    expect(mockSetActiveTool).toHaveBeenCalledWith('pen')
  })

  it('does not set tool when already active', () => {
    renderHook(() =>
      useOverlayKeyboard({
        phase: 'selected',
        activeTool: 'pen',
        setActiveTool: mockSetActiveTool,
        handleCopy: mockHandleCopy,
        handleSave: mockHandleSave,
        handleCancel: mockHandleCancel
      })
    )
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }))
    })
    expect(mockSetActiveTool).not.toHaveBeenCalled()
  })

  it('does not set tool with modifier keys', () => {
    renderHook(() =>
      useOverlayKeyboard({
        phase: 'selected',
        activeTool: 'select',
        setActiveTool: mockSetActiveTool,
        handleCopy: mockHandleCopy,
        handleSave: mockHandleSave,
        handleCancel: mockHandleCancel
      })
    )
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', ctrlKey: true }))
    })
    expect(mockSetActiveTool).not.toHaveBeenCalled()
  })

  it('ignores keys when typing in textarea', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    renderHook(() =>
      useOverlayKeyboard({
        phase: 'selected',
        activeTool: 'select',
        setActiveTool: mockSetActiveTool,
        handleCopy: mockHandleCopy,
        handleSave: mockHandleSave,
        handleCancel: mockHandleCancel
      })
    )
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(mockHandleCancel).not.toHaveBeenCalled()
    document.body.removeChild(textarea)
  })
})
