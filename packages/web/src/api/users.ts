import type {
  ApiResponse,
  Character,
  CreateCharacter,
  CreateUser,
  User,
} from '@awesomeness-mgmt/shared'
import { apiFetch } from './client'

export function getUsers(): Promise<ApiResponse<User[]>> {
  return apiFetch('/users')
}

export function createUser(body: CreateUser): Promise<ApiResponse<User>> {
  return apiFetch('/users', { method: 'POST', body })
}

export function getCharacters(userId: string): Promise<ApiResponse<Character[]>> {
  return apiFetch(`/users/${encodeURIComponent(userId)}/characters`)
}

export function createCharacter(
  userId: string,
  body: CreateCharacter,
): Promise<ApiResponse<Character>> {
  return apiFetch(`/users/${encodeURIComponent(userId)}/characters`, { method: 'POST', body })
}
