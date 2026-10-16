import type { RestKind } from '@player-ledger/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { takeRest } from '@/api/rest'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useTakeRest(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['takeRest', characterId],
    mutationFn: async (kind: RestKind) => {
      const response = await takeRest(characterId, { kind })
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: (state) => {
      queryClient.setQueryData(queryKeys.rest(characterId), state)
      // A rest refills slots and consumables, which those screens hold their own copies of.
      void queryClient.invalidateQueries({ queryKey: queryKeys.spells(characterId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory(characterId) })
    },
  })
}
