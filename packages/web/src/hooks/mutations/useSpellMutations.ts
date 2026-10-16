import type { CreateSpell, Spell, UpdateSpell } from '@player-ledger/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { castSpell, createSpell, deleteSpell, updateSpell } from '@/api/spells'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

/**
 * Writes the returned row straight into the list, so a checkbox or star answers
 * on the response rather than on the refetch behind it.
 */
function useSettleSpells(characterId: string) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.spells(characterId)

  return {
    replace: (spell: Spell) =>
      queryClient.setQueryData<Spell[]>(queryKey, (rows) =>
        rows?.map((row) => (row.id === spell.id ? spell : row)),
      ),
    invalidate: () => void queryClient.invalidateQueries({ queryKey }),
  }
}

export function useCreateSpell(characterId: string) {
  const settle = useSettleSpells(characterId)

  return useMutation({
    mutationKey: ['createSpell', characterId],
    mutationFn: async (input: CreateSpell) => {
      const response = await createSpell(characterId, input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSettled: settle.invalidate,
  })
}

export function useUpdateSpell(characterId: string) {
  const settle = useSettleSpells(characterId)
  const queryClient = useQueryClient()
  const queryKey = queryKeys.spells(characterId)

  return useMutation({
    mutationKey: ['updateSpell', characterId],
    mutationFn: async ({ spellId, input }: { spellId: string; input: UpdateSpell }) => {
      const response = await updateSpell(characterId, spellId, input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    // Optimistic: the Prepared checkbox and the star are toggles, and a toggle
    // that waits on the network reads as a missed click.
    onMutate: async ({ spellId, input }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Spell[]>(queryKey)
      queryClient.setQueryData<Spell[]>(queryKey, (rows) =>
        rows?.map((row) => (row.id === spellId ? { ...row, ...input } : row)),
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSuccess: settle.replace,
    onSettled: settle.invalidate,
  })
}

export function useDeleteSpell(characterId: string) {
  const settle = useSettleSpells(characterId)

  return useMutation({
    mutationKey: ['deleteSpell', characterId],
    mutationFn: async (spellId: string) => {
      const response = await deleteSpell(characterId, spellId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSettled: settle.invalidate,
  })
}

export function useCastSpell(characterId: string) {
  const settle = useSettleSpells(characterId)

  return useMutation({
    mutationKey: ['castSpell', characterId],
    mutationFn: async (spellId: string) => {
      const response = await castSpell(characterId, spellId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: settle.replace,
    onSettled: settle.invalidate,
  })
}
