import { useQuery } from '@tanstack/react-query'
import { getRest } from '@/api/rest'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useRest(characterId: string) {
  return useQuery({
    queryKey: queryKeys.rest(characterId),
    queryFn: async () => {
      const response = await getRest(characterId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}
