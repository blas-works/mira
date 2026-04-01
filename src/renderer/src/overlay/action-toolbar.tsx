import { Copy, Save, X, Undo2, Redo2, ScanText } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

interface ActionToolbarProps {
  onCopy: () => void
  onSave: () => void
  onOcr: () => void
  onCancel: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  position?: { x: number; y: number }
}

const modKey = navigator.platform.includes('Mac') ? '⌘' : 'Ctrl+'

export function ActionToolbar({
  onCopy,
  onSave,
  onOcr,
  onCancel,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  position
}: ActionToolbarProps): React.JSX.Element {
  return (
    <TooltipProvider>
      <div
        className={`${position ? 'absolute' : ''} z-50 flex gap-0.5 bg-(--toolbar-bg) backdrop-blur-xl p-1 rounded-lg shadow-2xl border border-(--toolbar-border) animate-toolbar-enter`}
        style={position ? { left: position.x, top: position.y } : undefined}
      >
        <Tooltip>
          <TooltipTrigger
            onMouseDown={(e: React.MouseEvent) => {
              e.preventDefault()
              if (canUndo) onUndo()
            }}
            className={`p-2 rounded-md flex items-center justify-center transition-all duration-150 ${
              canUndo
                ? 'text-neutral-400 hover:bg-white/10 hover:text-foreground'
                : 'text-neutral-600 cursor-default'
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} className="text-xs font-medium">
            Undo ({modKey}Z)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            onMouseDown={(e: React.MouseEvent) => {
              e.preventDefault()
              if (canRedo) onRedo()
            }}
            className={`p-2 rounded-md flex items-center justify-center transition-all duration-150 ${
              canRedo
                ? 'text-neutral-400 hover:bg-white/10 hover:text-foreground'
                : 'text-neutral-600 cursor-default'
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} className="text-xs font-medium">
            Redo ({modKey}Shift+Z)
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-auto" />

        <Tooltip>
          <TooltipTrigger
            onClick={onCopy}
            className="p-2 rounded-md flex items-center justify-center bg-accent-blue-muted text-accent-blue hover:bg-accent-blue hover:text-accent-blue-foreground transition-all duration-150"
          >
            <Copy className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} className="text-xs font-medium">
            Copy ({modKey}C)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            onClick={onSave}
            className="p-2 rounded-md flex items-center justify-center text-neutral-400 hover:bg-white/10 hover:text-foreground transition-all duration-150"
          >
            <Save className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} className="text-xs font-medium">
            Save ({modKey}S)
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            onClick={onOcr}
            className="p-2 rounded-md flex items-center justify-center text-neutral-400 hover:bg-white/10 hover:text-foreground transition-all duration-150"
          >
            <ScanText className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} className="text-xs font-medium">
            OCR — Copy text
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-auto" />

        <Tooltip>
          <TooltipTrigger
            onClick={onCancel}
            className="p-2 rounded-md flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-all duration-150"
          >
            <X className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} className="text-xs font-medium">
            Cancel (Esc)
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
