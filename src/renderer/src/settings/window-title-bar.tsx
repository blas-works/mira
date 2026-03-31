export function WindowTitleBar(): React.JSX.Element {
  const handleClose = (): void => {
    window.api.window.close()
  }

  return (
    <div className="h-10 flex items-center px-4 border-b border-border bg-card/80 backdrop-blur-sm select-none [-webkit-app-region:drag]">
      <div className="flex-1" />
      <span className="text-xs font-medium text-muted-foreground tracking-tight">Preferences</span>
      <div className="flex-1 flex justify-end">
        <button
          onClick={handleClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors [-webkit-app-region:no-drag]"
          aria-label="Close"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M1 1l8 8M9 1l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
