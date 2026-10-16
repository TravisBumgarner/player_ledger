import type { ApiResponse, CreateSpell, Spell, UpdateSpell } from '@player-ledger/shared'
import { apiFetch } from './client'

const spellsPath = (characterId: string) => `/characters/${encodeURIComponent(characterId)}/spells`

const spellPath = (characterId: string, spellId: string) =>
  `${spellsPath(characterId)}/${encodeURIComponent(spellId)}`

export function getSpells(characterId: string): Promise<ApiResponse<Spell[]>> {
  return apiFetch(spellsPath(characterId))
}

export function createSpell(characterId: string, body: CreateSpell): Promise<ApiResponse<Spell>> {
  return apiFetch(spellsPath(characterId), { method: 'POST', body })
}

export function updateSpell(
  characterId: string,
  spellId: string,
  body: UpdateSpell,
): Promise<ApiResponse<Spell>> {
  return apiFetch(spellPath(characterId, spellId), { method: 'PATCH', body })
}

export function deleteSpell(
  characterId: string,
  spellId: string,
): Promise<ApiResponse<{ id: string }>> {
  return apiFetch(spellPath(characterId, spellId), { method: 'DELETE' })
}

export function castSpell(characterId: string, spellId: string): Promise<ApiResponse<Spell>> {
  return apiFetch(`${spellPath(characterId, spellId)}/cast`, { method: 'POST' })
}
