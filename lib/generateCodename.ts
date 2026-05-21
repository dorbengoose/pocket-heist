/**
 * Generates a random codename by combining three heist-themed words in PascalCase.
 * Provides 1,728 unique combinations (12^3).
 */
export function generateCodename(): string {
  const adjectives = [
    'Silent',
    'Swift',
    'Phantom',
    'Shadow',
    'Sly',
    'Covert',
    'Rogue',
    'Ghost',
    'Nimble',
    'Brazen',
    'Slick',
    'Hollow',
  ]

  const colors = [
    'Black',
    'Crimson',
    'Silver',
    'Cobalt',
    'Amber',
    'Ivory',
    'Scarlet',
    'Onyx',
    'Copper',
    'Jade',
    'Ash',
    'Steel',
  ]

  const animals = [
    'Fox',
    'Raven',
    'Viper',
    'Wolf',
    'Lynx',
    'Cobra',
    'Hawk',
    'Jackal',
    'Mink',
    'Ferret',
    'Coyote',
    'Dagger',
  ]

  const randomWord = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

  return randomWord(adjectives) + randomWord(colors) + randomWord(animals)
}
