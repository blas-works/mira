import { MousePointer2, Pen, ArrowUpRight, Square, Type, Grid2x2, Pipette } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ColorPicker } from './color-picker'
import { FontSizePicker } from './font-size-picker'
import { TOOL_SHORTCUTS } from '@shared/constants'
import type { AnnotationTool } from '@shared/types'

interface AnnotationToolbarProps {
  activeTool: AnnotationTool
  activeColor: string
  activeFontSize: number
  onToolChange: (tool: AnnotationTool) => void
  onColorChange: (color: string) => void
  onFontSizeChange: (size: number) => void
  position?: { x: number; y: number }
}

const ANNOTATION_TOOLS: { tool: AnnotationTool; icon: typeof MousePointer2 }[] = [
  { tool: 'select', icon: MousePointer2 },
  { tool: 'pen', icon: Pen },
  { tool: 'arrow', icon: ArrowUpRight },
  { tool: 'rect', icon: Square },
  { tool: 'text', icon: Type },
  { tool: 'blur', icon: Grid2x2 }
]

const UTILITY_TOOLS: { tool: AnnotationTool; icon: typeof MousePointer2 }[] = [
  { tool: 'eyedropper', icon: Pipette }
]

export function AnnotationToolbar({
  activeTool,
  activeColor,
  activeFontSize,
  onToolChange,
  onColorChange,
  onFontSizeChange,
  position
}: AnnotationToolbarProps): React.JSX.Element {
  return (
    <TooltipProvider>
      <div
        className={`${position ? 'absolute' : ''} z-50 flex flex-col gap-0.5 bg-(--toolbar-bg) backdrop-blur-xl p-1 rounded-lg shadow-2xl border border-(--toolbar-border) animate-toolbar-enter`}
        style={position ? { left: position.x, top: position.y } : undefined}
      >
        {ANNOTATION_TOOLS.map(({ tool, icon: Icon }) => (
          <Tooltip key={tool}>
            <TooltipTrigger
              onClick={() => onToolChange(tool)}
              className={`p-2 rounded-md flex items-center justify-center transition-all duration-150 ${
                activeTool === tool
                  ? 'bg-accent-blue-muted text-accent-blue ring-1 ring-(--accent-blue)/30'
                  : 'text-neutral-400 hover:bg-white/6 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={5} className="text-xs font-medium">
              {TOOL_SHORTCUTS[tool].label}
            </TooltipContent>
          </Tooltip>
        ))}
        <Separator className="my-1" />
        {UTILITY_TOOLS.map(({ tool, icon: Icon }) => (
          <Tooltip key={tool}>
            <TooltipTrigger
              onClick={() => onToolChange(tool)}
              className={`p-2 rounded-md flex items-center justify-center transition-all duration-150 ${
                activeTool === tool
                  ? 'bg-accent-blue-muted text-accent-blue ring-1 ring-(--accent-blue)/30'
                  : 'text-neutral-400 hover:bg-white/6 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={5} className="text-xs font-medium">
              {TOOL_SHORTCUTS[tool].label}
            </TooltipContent>
          </Tooltip>
        ))}
        <Separator className="my-1" />
        <ColorPicker activeColor={activeColor} onColorChange={onColorChange} />
        {activeTool === 'text' && (
          <>
            <Separator className="my-1" />
            <FontSizePicker activeFontSize={activeFontSize} onFontSizeChange={onFontSizeChange} />
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
