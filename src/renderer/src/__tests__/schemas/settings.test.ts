import { describe, it, expect } from 'vitest'
import { shortcutConfigSchema, appSettingsSchema } from '@/schemas/settings'
import { DEFAULT_SETTINGS } from '@shared/constants'

describe('shortcutConfigSchema', () => {
  it('validates a valid shortcut config', () => {
    const result = shortcutConfigSchema.safeParse({ captureArea: 'CommandOrControl+1' })
    expect(result.success).toBe(true)
  })

  it('rejects empty string', () => {
    const result = shortcutConfigSchema.safeParse({ captureArea: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing captureArea', () => {
    const result = shortcutConfigSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('appSettingsSchema', () => {
  it('validates complete valid settings', () => {
    const result = appSettingsSchema.safeParse(DEFAULT_SETTINGS)
    expect(result.success).toBe(true)
  })

  it('validates minimal valid settings', () => {
    const result = appSettingsSchema.safeParse({
      launchAtStartup: false,
      captureSound: true,
      showMagnifier: false,
      shortcuts: { captureArea: 'Ctrl+A' }
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing shortcuts', () => {
    const result = appSettingsSchema.safeParse({
      launchAtStartup: false,
      captureSound: true,
      showMagnifier: false
    })
    expect(result.success).toBe(false)
  })

  it('rejects wrong types', () => {
    const result = appSettingsSchema.safeParse({
      launchAtStartup: 'yes',
      captureSound: true,
      showMagnifier: false,
      shortcuts: { captureArea: 'Ctrl+A' }
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid shortcut in nested schema', () => {
    const result = appSettingsSchema.safeParse({
      launchAtStartup: false,
      captureSound: true,
      showMagnifier: false,
      shortcuts: { captureArea: '' }
    })
    expect(result.success).toBe(false)
  })
})
