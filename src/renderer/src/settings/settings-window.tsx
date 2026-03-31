import { WindowTitleBar } from './window-title-bar'
import { GeneralSettings } from './general-settings'
import { ShortcutSettings } from './shortcut-settings'
import { UpdateNotification } from './update-notification'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettings } from '@/hooks/use-settings'
import { useUpdate } from '@/hooks/use-update'

export function SettingsWindow(): React.JSX.Element {
  const { settings, loading, updateSetting, updateShortcut } = useSettings()
  const { updateInfo, restartNow, snoozeUpdate, brewUpgrade, dismissUpdate } = useUpdate()

  if (loading) {
    return (
      <div className="h-screen w-screen overflow-hidden rounded-xl bg-background border border-white/8 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden rounded-xl bg-background border border-white/8">
      <WindowTitleBar />
      <UpdateNotification
        updateInfo={updateInfo}
        onRestart={restartNow}
        onSnooze={snoozeUpdate}
        onBrewUpgrade={brewUpgrade}
        onDismiss={dismissUpdate}
      />
      <Tabs defaultValue="general" className="w-full">
        <TabsList
          variant="line"
          className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto"
        >
          <TabsTrigger
            value="general"
            className="rounded-none px-6 py-3 text-sm text-muted-foreground data-active:text-foreground"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="shortcuts"
            className="rounded-none px-6 py-3 text-sm text-muted-foreground data-active:text-foreground"
          >
            Shortcuts
          </TabsTrigger>
        </TabsList>

        <div className="px-7 py-5">
          <TabsContent value="general" className="mt-0">
            <GeneralSettings settings={settings} onUpdateSetting={updateSetting} />
          </TabsContent>
          <TabsContent value="shortcuts" className="mt-0">
            <ShortcutSettings settings={settings} onUpdateShortcut={updateShortcut} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
