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

const DATA_URL_PNG_PREFIX = 'data:image/png;base64,'

export const editorDataSchema = z.object({
  imageDataURL: z
    .string()
    .startsWith(DATA_URL_PNG_PREFIX, 'Must be a PNG data URL')
    .refine((val) => val.length > DATA_URL_PNG_PREFIX.length, 'Empty base64 data'),
  width: z.number().int().positive().max(7680),
  height: z.number().int().positive().max(4320),
  scaleFactor: z.number().positive().max(4)
})
