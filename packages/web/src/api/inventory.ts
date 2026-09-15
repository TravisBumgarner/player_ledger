import type {
  ApiResponse,
  CreateItem,
  CreateItemNote,
  InventoryItem,
  LogItemUse,
  UpdateItem,
} from '@awesomeness-mgmt/shared'
import { apiFetch } from './client'

const base = (characterId: string) => `/characters/${encodeURIComponent(characterId)}/inventory`
const itemPath = (characterId: string, itemId: string) =>
  `${base(characterId)}/${encodeURIComponent(itemId)}`

export function getInventory(characterId: string): Promise<ApiResponse<InventoryItem[]>> {
  return apiFetch(base(characterId))
}

export function createItem(
  characterId: string,
  body: CreateItem,
): Promise<ApiResponse<InventoryItem>> {
  return apiFetch(base(characterId), { method: 'POST', body })
}

export function updateItem(
  characterId: string,
  itemId: string,
  body: UpdateItem,
): Promise<ApiResponse<InventoryItem>> {
  return apiFetch(itemPath(characterId, itemId), { method: 'PATCH', body })
}

export function deleteItem(
  characterId: string,
  itemId: string,
): Promise<ApiResponse<{ id: string }>> {
  return apiFetch(itemPath(characterId, itemId), { method: 'DELETE' })
}

export function archiveItem(
  characterId: string,
  itemId: string,
): Promise<ApiResponse<InventoryItem>> {
  return apiFetch(`${itemPath(characterId, itemId)}/archive`, { method: 'POST' })
}

export function addItemNote(
  characterId: string,
  itemId: string,
  body: CreateItemNote,
): Promise<ApiResponse<InventoryItem>> {
  return apiFetch(`${itemPath(characterId, itemId)}/notes`, { method: 'POST', body })
}

export function logItemUse(
  characterId: string,
  itemId: string,
  body: LogItemUse,
): Promise<ApiResponse<InventoryItem>> {
  return apiFetch(`${itemPath(characterId, itemId)}/use`, { method: 'POST', body })
}
