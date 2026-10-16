import type { NoteKind } from '@player-ledger/shared'

/** Every key in one place, so invalidation cannot drift from subscription. */
export const queryKeys = {
  health: () => ['health'] as const,
  users: () => ['users'] as const,
  characters: (userId: string) => ['users', userId, 'characters'] as const,

  /** Everything a character owns sits under this prefix. */
  ledger: (characterId: string) => ['ledger', characterId] as const,
  rest: (characterId: string) => ['ledger', characterId, 'rest'] as const,
  spells: (characterId: string) => ['ledger', characterId, 'spells'] as const,
  inventory: (characterId: string) => ['ledger', characterId, 'inventory'] as const,
  brewing: (characterId: string) => ['ledger', characterId, 'brewing'] as const,
  recipes: (characterId: string) => ['ledger', characterId, 'recipes'] as const,
  ingredients: (characterId: string) => ['ledger', characterId, 'ingredients'] as const,
  goals: (characterId: string) => ['ledger', characterId, 'goals'] as const,
  modifiers: (characterId: string) => ['ledger', characterId, 'modifiers'] as const,
  notes: (characterId: string, kind: NoteKind) => ['ledger', characterId, 'notes', kind] as const,
  profiles: (characterId: string) => ['ledger', characterId, 'profiles'] as const,
  backlinks: (characterId: string, ref: string) =>
    ['ledger', characterId, 'profiles', ref, 'backlinks'] as const,
}
