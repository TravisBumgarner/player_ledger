import { useQuery } from '@tanstack/react-query'
import { getGoals, getSessionNotes } from '@/api/journal'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

/** Oldest first, as the server orders them. */
export function useGoals(characterId: string) {
  return useQuery({
    queryKey: queryKeys.goals(characterId),
    queryFn: async () => {
      const response = await getGoals(characterId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}

/** Newest first, as the server orders them. */
export function useSessionNotes(characterId: string) {
  return useQuery({
    queryKey: queryKeys.sessionNotes(characterId),
    queryFn: async () => {
      const response = await getSessionNotes(characterId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}
