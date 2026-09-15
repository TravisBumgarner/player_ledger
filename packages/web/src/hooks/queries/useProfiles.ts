import { useQuery } from '@tanstack/react-query'
import { getBacklinks, getProfiles } from '@/api/profiles'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

/** Party members first, then NPCs — the order the server returns. Also the @mention list. */
export function useProfiles(characterId: string) {
  return useQuery({
    queryKey: queryKeys.profiles(characterId),
    queryFn: async () => {
      const response = await getProfiles(characterId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}

export function useBacklinks(characterId: string, ref: string | null) {
  return useQuery({
    queryKey: queryKeys.backlinks(characterId, ref ?? ''),
    enabled: ref !== null,
    queryFn: async () => {
      const response = await getBacklinks(characterId, ref ?? '')
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}
