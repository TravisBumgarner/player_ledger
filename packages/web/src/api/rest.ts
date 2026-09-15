import type { ApiResponse, RestState, TakeRest } from '@awesomeness-mgmt/shared'
import { apiFetch } from './client'

const restPath = (characterId: string) => `/characters/${encodeURIComponent(characterId)}/rest`

export function getRest(characterId: string): Promise<ApiResponse<RestState>> {
  return apiFetch(restPath(characterId))
}

export function takeRest(characterId: string, body: TakeRest): Promise<ApiResponse<RestState>> {
  return apiFetch(restPath(characterId), { method: 'POST', body })
}
