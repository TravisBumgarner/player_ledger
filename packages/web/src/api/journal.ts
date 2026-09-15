import type {
  ApiResponse,
  CreateGoal,
  CreateSessionNote,
  Goal,
  SessionNote,
  UpdateGoal,
} from '@awesomeness-mgmt/shared'
import { apiFetch } from './client'

const characterPath = (characterId: string) => `/characters/${encodeURIComponent(characterId)}`
const goalsPath = (characterId: string) => `${characterPath(characterId)}/goals`
const notesPath = (characterId: string) => `${characterPath(characterId)}/session-notes`

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

export function getSessionNotes(characterId: string): Promise<ApiResponse<SessionNote[]>> {
  return apiFetch(notesPath(characterId))
}

export function createSessionNote(
  characterId: string,
  body: CreateSessionNote,
): Promise<ApiResponse<SessionNote>> {
  return apiFetch(notesPath(characterId), { method: 'POST', body })
}

export function deleteSessionNote(
  characterId: string,
  noteId: string,
): Promise<ApiResponse<{ id: string }>> {
  return apiFetch(`${notesPath(characterId)}/${encodeURIComponent(noteId)}`, { method: 'DELETE' })
}
