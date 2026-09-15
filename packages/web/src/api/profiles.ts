import {
  type ApiResponse,
  type Backlink,
  type CharacterProfile,
  type CreateNpc,
  log,
  type UpdateProfile,
} from '@awesomeness-mgmt/shared'
import config from '@/config'
import { apiFetch } from './client'

const profilesPath = (characterId: string) =>
  `/characters/${encodeURIComponent(characterId)}/profiles`
const profilePath = (characterId: string, ref: string) =>
  `${profilesPath(characterId)}/${encodeURIComponent(ref)}`

export function getProfiles(characterId: string): Promise<ApiResponse<CharacterProfile[]>> {
  return apiFetch(profilesPath(characterId))
}

export function createNpc(
  characterId: string,
  body: CreateNpc,
): Promise<ApiResponse<CharacterProfile>> {
  return apiFetch(profilesPath(characterId), { method: 'POST', body })
}

export function updateProfile(
  characterId: string,
  ref: string,
  body: UpdateProfile,
): Promise<ApiResponse<CharacterProfile>> {
  return apiFetch(profilePath(characterId, ref), { method: 'PATCH', body })
}

export function deleteProfile(
  characterId: string,
  ref: string,
): Promise<ApiResponse<{ ref: string }>> {
  return apiFetch(profilePath(characterId, ref), { method: 'DELETE' })
}

export function getBacklinks(characterId: string, ref: string): Promise<ApiResponse<Backlink[]>> {
  return apiFetch(`${profilePath(characterId, ref)}/backlinks`)
}

/** Raw bytes rather than JSON, so this bypasses `apiFetch`. The server sniffs the type itself. */
export async function uploadProfileImage(
  characterId: string,
  ref: string,
  image: Blob,
): Promise<ApiResponse<CharacterProfile>> {
  const path = `${profilePath(characterId, ref)}/image`
  try {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': image.type },
      body: image,
    })
    return (await response.json()) as ApiResponse<CharacterProfile>
  } catch (error) {
    log.error(error instanceof Error ? error : new Error(String(error)), {
      source: 'uploadProfileImage',
      path,
    })
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

export function deleteProfileImage(
  characterId: string,
  ref: string,
): Promise<ApiResponse<CharacterProfile>> {
  return apiFetch(`${profilePath(characterId, ref)}/image`, { method: 'DELETE' })
}
