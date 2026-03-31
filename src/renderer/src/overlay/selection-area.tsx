import type { SelectionRect } from '@shared/types'
import type { MouseEvent } from 'react'

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface SelectionAreaProps {
  selection: SelectionRect
  onMouseDown: (e: MouseEvent) => void
  onHandleMouseDown: (handle: ResizeHandle, e: MouseEvent) => void
  className?: string
}

const HANDLES: { handle: ResizeHandle; cursor: string; position: string }[] = [
  { handle: 'nw', cursor: 'nwse-resize', position: '-top-[5px] -left-[5px]' },
  { handle: 'n', cursor: 'ns-resize', position: '-top-[5px] left-1/2 -translate-x-1/2' },
  { handle: 'ne', cursor: 'nesw-resize', position: '-top-[5px] -right-[5px]' },
  { handle: 'e', cursor: 'ew-resize', position: 'top-1/2 -right-[5px] -translate-y-1/2' },
  { handle: 'se', cursor: 'nwse-resize', position: '-bottom-[5px] -right-[5px]' },
  { handle: 's', cursor: 'ns-resize', position: '-bottom-[5px] left-1/2 -translate-x-1/2' },
  { handle: 'sw', cursor: 'nesw-resize', position: '-bottom-[5px] -left-[5px]' },
  { handle: 'w', cursor: 'ew-resize', position: 'top-1/2 -left-[5px] -translate-y-1/2' }
]

export function SelectionArea({
  selection,
  onMouseDown,
  onHandleMouseDown,
  className
}: SelectionAreaProps): React.JSX.Element {
  return (
    <div
      className={`absolute border-2 border-(--selection-border) shadow-[0_0_0_1px_var(--selection-border)/30,0_0_24px_-4px_var(--selection-glow)] cursor-move ${
        className || ''
      }`}
      style={{
        left: selection.x,
        top: selection.y,
        width: selection.width,
        height: selection.height
      }}
      onMouseDown={onMouseDown}
    >
      {HANDLES.map(({ handle, cursor, position }) => (
        <div
          key={handle}
          className={`absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_0_1.5px_var(--selection-border),0_0_8px_var(--selection-glow)] hover:scale-125 transition-transform duration-100 ${position}`}
          style={{ cursor }}
          onMouseDown={(e) => onHandleMouseDown(handle, e)}
        />
      ))}
    </div>
  )
}
