import type { NoteKind } from '@awesomeness-mgmt/shared'
import { useQuery } from '@tanstack/react-query'
import { getGoals, getModifiers, getNotes } from '@/api/journal'
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

/** Oldest first, as the server orders them. */
export function useModifiers(characterId: string) {
  return useQuery({
    queryKey: queryKeys.modifiers(characterId),
    queryFn: async () => {
      const response = await getModifiers(characterId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}

/** Newest first, as the server orders them. */
export function useNotes(characterId: string, kind: NoteKind) {
  return useQuery({
    queryKey: queryKeys.notes(characterId, kind),
    queryFn: async () => {
      const response = await getNotes(characterId, kind)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}
