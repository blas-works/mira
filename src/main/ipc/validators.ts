import { z } from 'zod/v4'

const ALLOWED_SHORTCUT_ACTIONS = ['captureArea'] as const

const shortcutKeysSchema = z
  .string()
  .regex(
    /^(CommandOrControl|Ctrl|Shift|Alt|Meta)(\+(CommandOrControl|Ctrl|Shift|Alt|Meta))*\+[A-Za-z0-9]+$/,
    'Invalid shortcut key combination'
  )

const ALLOWED_OCR_LANGUAGES = ['eng', 'spa'] as const

export const settingsUpdateSchema = z
  .object({
    launchAtStartup: z.boolean().optional(),
    captureSound: z.boolean().optional(),
    showMagnifier: z.boolean().optional(),
    ocrLanguages: z.array(z.enum(ALLOWED_OCR_LANGUAGES)).min(1).optional(),
    shortcuts: z
      .object({
        captureArea: shortcutKeysSchema.optional()
      })
      .strict()
      .optional()
  })
  .strict()

export const shortcutRegisterSchema = z.object({
  action: z.enum(ALLOWED_SHORTCUT_ACTIONS),
  keys: shortcutKeysSchema
})
