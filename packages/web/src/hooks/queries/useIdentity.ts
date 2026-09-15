import { useQuery } from '@tanstack/react-query'
import { getCharacters, getUsers } from '@/api/users'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'
import { useCharacterId, useUserId } from '@/store/useIdentityStore'

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users(),
    queryFn: async () => {
      const response = await getUsers()
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}

/**
 * The remembered ids resolved against the server. An id that no longer resolves —
 * the database was reset, say — comes back as null, and the gate asks again.
 */
export function useCurrentIdentity() {
  const userId = useUserId()
  const characterId = useCharacterId()
  const users = useUsers()
  const user = users.data?.find((row) => row.id === userId) ?? null
  const characters = useCharacters(user?.id ?? null)
  const character = characters.data?.find((row) => row.id === characterId) ?? null

  return { user, character, users, characters }
}

export function useCharacters(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.characters(userId ?? ''),
    enabled: userId !== null,
    queryFn: async () => {
      const response = await getCharacters(userId ?? '')
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}
