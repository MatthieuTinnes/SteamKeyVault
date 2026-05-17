import { describe, it, expect } from 'vitest'
import { CUSTOM_GAME_PLATFORMS, CUSTOM_GAME_PLATFORM_MAX_LENGTH } from '../customGamePlatforms'

describe('CUSTOM_GAME_PLATFORMS', () => {
  it('contains known platforms', () => {
    expect(CUSTOM_GAME_PLATFORMS).toContain('Steam')
    expect(CUSTOM_GAME_PLATFORMS).toContain('Epic Games Store')
    expect(CUSTOM_GAME_PLATFORMS).toContain('GOG')
  })

  it('has exactly 11 platforms', () => {
    expect(CUSTOM_GAME_PLATFORMS).toHaveLength(11)
  })

  it('contains only non-empty strings', () => {
    for (const platform of CUSTOM_GAME_PLATFORMS) {
      expect(typeof platform).toBe('string')
      expect(platform.length).toBeGreaterThan(0)
    }
  })
})

describe('CUSTOM_GAME_PLATFORM_MAX_LENGTH', () => {
  it('equals 100', () => {
    expect(CUSTOM_GAME_PLATFORM_MAX_LENGTH).toBe(100)
  })
})
