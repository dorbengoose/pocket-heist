import { describe, it, expect } from 'vitest'
import { generateCodename } from '@/lib/generateCodename'

describe('generateCodename', () => {
  it('returns a string', () => {
    const codename = generateCodename()
    expect(typeof codename).toBe('string')
  })

  it('returns a codename in PascalCase format (three capitalized words)', () => {
    const codename = generateCodename()
    // Match three PascalCase words concatenated: [A-Z][a-z]+ three times
    const pascalCaseRegex = /^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/
    expect(codename).toMatch(pascalCaseRegex)
  })

  it('returns different values across multiple calls', () => {
    const codenameSet = new Set<string>()
    // Generate 20 codenames and collect them
    for (let i = 0; i < 20; i++) {
      codenameSet.add(generateCodename())
    }
    // With 1,728 possible combinations, getting all 20 identical is virtually impossible
    // We should have at least some variety
    expect(codenameSet.size).toBeGreaterThan(1)
  })
})
