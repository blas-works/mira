import { z } from 'zod/v4'

export const shortcutConfigSchema = z.object({
  captureArea: z.string().min(1)
})

export const appSettingsSchema = z.object({
  launchAtStartup: z.boolean(),
  captureSound: z.boolean(),
  showMagnifier: z.boolean(),
  ocrLanguages: z.array(z.string().min(1)).min(1),
  shortcuts: shortcutConfigSchema
})

export type AppSettingsInput = z.input<typeof appSettingsSchema>
