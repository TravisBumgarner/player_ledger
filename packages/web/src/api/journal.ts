import type {
  ApiResponse,
  CharacterDevelopment,
  CreateGoal,
  CreateSessionNote,
  Goal,
  NoteKind,
  SessionNote,
  UpdateCharacterDevelopment,
  UpdateGoal,
  UpdateSessionNote,
} from '@awesomeness-mgmt/shared'
import { apiFetch } from './client'

const characterPath = (characterId: string) => `/characters/${encodeURIComponent(characterId)}`
const goalsPath = (characterId: string) => `${characterPath(characterId)}/goals`
const NOTE_PATHS: Record<NoteKind, string> = { session: 'session-notes', brewing: 'brewing-notes' }
const notesPath = (characterId: string, kind: NoteKind) =>
  `${characterPath(characterId)}/${NOTE_PATHS[kind]}`

export function getGoals(characterId: string): Promise<ApiResponse<Goal[]>> {
  return apiFetch(goalsPath(characterId))
}

export function createGoal(characterId: string, body: CreateGoal): Promise<ApiResponse<Goal>> {
  return apiFetch(goalsPath(characterId), { method: 'POST', body })
}

export function updateGoal(
  characterId: string,
  goalId: string,
  body: UpdateGoal,
): Promise<ApiResponse<Goal>> {
  return apiFetch(`${goalsPath(characterId)}/${encodeURIComponent(goalId)}`, {
    method: 'PATCH',
    body,
  })
}

export function deleteGoal(
  characterId: string,
  goalId: string,
): Promise<ApiResponse<{ id: string }>> {
  return apiFetch(`${goalsPath(characterId)}/${encodeURIComponent(goalId)}`, { method: 'DELETE' })
}

export function getNotes(characterId: string, kind: NoteKind): Promise<ApiResponse<SessionNote[]>> {
  return apiFetch(notesPath(characterId, kind))
}

export function createNote(
  characterId: string,
  kind: NoteKind,
  body: CreateSessionNote,
): Promise<ApiResponse<SessionNote>> {
  return apiFetch(notesPath(characterId, kind), { method: 'POST', body })
}

export function updateNote(
  characterId: string,
  kind: NoteKind,
  noteId: string,
  body: UpdateSessionNote,
): Promise<ApiResponse<SessionNote>> {
  return apiFetch(`${notesPath(characterId, kind)}/${encodeURIComponent(noteId)}`, {
    method: 'PATCH',
    body,
  })
}

export function deleteNote(
  characterId: string,
  kind: NoteKind,
  noteId: string,
): Promise<ApiResponse<{ id: string }>> {
  return apiFetch(`${notesPath(characterId, kind)}/${encodeURIComponent(noteId)}`, {
    method: 'DELETE',
  })
}

export function getCharacterDevelopment(
  characterId: string,
): Promise<ApiResponse<CharacterDevelopment>> {
  return apiFetch(`${characterPath(characterId)}/development`)
}

export function saveCharacterDevelopment(
  characterId: string,
  body: UpdateCharacterDevelopment,
): Promise<ApiResponse<CharacterDevelopment>> {
  return apiFetch(`${characterPath(characterId)}/development`, { method: 'PUT', body })
}
