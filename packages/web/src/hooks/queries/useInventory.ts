import { useQuery } from '@tanstack/react-query'
import { getInventory } from '@/api/inventory'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useInventory(characterId: string) {
  return useQuery({
    queryKey: queryKeys.inventory(characterId),
    queryFn: async () => {
      const response = await getInventory(characterId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}
