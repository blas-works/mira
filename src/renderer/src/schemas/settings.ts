import { z } from 'zod/v4'

export const shortcutConfigSchema = z.object({
  captureArea: z.string().min(1)
})

export const appSettingsSchema = z.object({
  launchAtStartup: z.boolean(),
  captureSound: z.boolean(),
  showMagnifier: z.boolean(),
  shortcuts: shortcutConfigSchema
})

export type AppSettingsInput = z.input<typeof appSettingsSchema>
