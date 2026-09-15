import type {
  ApiResponse,
  CreateItem,
  CreateItemNote,
  InventoryItem,
  LogItemUse,
  UpdateItem,
} from '@awesomeness-mgmt/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addItemNote,
  archiveItem,
  createItem,
  deleteItem,
  logItemUse,
  updateItem,
} from '@/api/inventory'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

/**
 * Every mutation returns the item it changed, which is written straight into the
 * list so a checkbox or star answers on the response rather than on the refetch.
 */
function useInventoryMutation<TInput, TData>(
  name: string,
  characterId: string,
  request: (input: TInput) => Promise<ApiResponse<TData>>,
) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.inventory(characterId)

  return useMutation({
    mutationKey: [name, characterId],
    mutationFn: async (input: TInput) => {
      const response = await request(input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: (data) => {
      if (!isItem(data)) return
      queryClient.setQueryData<InventoryItem[]>(queryKey, (rows) =>
        rows?.map((row) => (row.id === data.id ? data : row)),
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

function isItem(data: unknown): data is InventoryItem {
  return typeof data === 'object' && data !== null && 'notes' in data
}

export function useCreateItem(characterId: string) {
  return useInventoryMutation('createItem', characterId, (input: CreateItem) =>
    createItem(characterId, input),
  )
}

export function useUpdateItem(characterId: string) {
  return useInventoryMutation(
    'updateItem',
    characterId,
    ({ itemId, patch }: { itemId: string; patch: UpdateItem }) =>
      updateItem(characterId, itemId, patch),
  )
}

export function useDeleteItem(characterId: string) {
  return useInventoryMutation('deleteItem', characterId, (itemId: string) =>
    deleteItem(characterId, itemId),
  )
}

export function useArchiveItem(characterId: string) {
  return useInventoryMutation('archiveItem', characterId, (itemId: string) =>
    archiveItem(characterId, itemId),
  )
}

export function useAddItemNote(characterId: string) {
  return useInventoryMutation(
    'addItemNote',
    characterId,
    ({ itemId, ...body }: CreateItemNote & { itemId: string }) =>
      addItemNote(characterId, itemId, body),
  )
}

export function useLogItemUse(characterId: string) {
  return useInventoryMutation(
    'logItemUse',
    characterId,
    ({ itemId, ...body }: LogItemUse & { itemId: string }) => logItemUse(characterId, itemId, body),
  )
}
