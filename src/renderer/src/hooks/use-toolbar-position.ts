import type { SelectionRect } from '@shared/types'

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

interface UseToolbarPositionReturn {
  annotationToolbarPos: Position
  actionToolbarPos: Position
}

function clampToViewport(pos: Position, size: Size): Position {
  return {
    x: Math.max(4, Math.min(pos.x, window.innerWidth - size.width - 4)),
    y: Math.max(4, Math.min(pos.y, window.innerHeight - size.height - 4))
  }
}

function getAnnotationToolbarPos(selection: SelectionRect): Position {
  const rightSpace = window.innerWidth - (selection.x + selection.width)
  const preferred =
    rightSpace > 50
      ? { x: selection.x + selection.width + 6, y: selection.y }
      : { x: selection.x - 42, y: selection.y }
  return clampToViewport(preferred, { width: 36, height: 200 })
}

const ACTION_TOOLBAR_WIDTH = 230

function getActionToolbarPos(selection: SelectionRect): Position {
  const bottomSpace = window.innerHeight - (selection.y + selection.height)
  const preferred =
    bottomSpace > 50
      ? {
          x: selection.x + selection.width - ACTION_TOOLBAR_WIDTH,
          y: selection.y + selection.height + 6
        }
      : {
          x: selection.x + selection.width - ACTION_TOOLBAR_WIDTH,
          y: selection.y - 42
        }
  return clampToViewport(preferred, { width: ACTION_TOOLBAR_WIDTH, height: 36 })
}

export function useToolbarPosition(selection: SelectionRect | null): UseToolbarPositionReturn {
  const defaultPos: Position = { x: 0, y: 0 }

  return {
    annotationToolbarPos: selection ? getAnnotationToolbarPos(selection) : defaultPos,
    actionToolbarPos: selection ? getActionToolbarPos(selection) : defaultPos
  }
}
