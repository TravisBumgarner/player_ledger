import { useQuery } from '@tanstack/react-query'
import { getSpells } from '@/api/spells'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

/** Oldest first, as the server orders them. */
export function useSpells(characterId: string) {
  return useQuery({
    queryKey: queryKeys.spells(characterId),
    queryFn: async () => {
      const response = await getSpells(characterId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}
