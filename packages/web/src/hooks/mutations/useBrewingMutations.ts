import type {
  ApiResponse,
  BrewingState,
  CreateIngredient,
  CreateRecipe,
  Ingredient,
  Recipe,
  StartBrew,
  UpdateBrewingLevel,
  UpdateIngredient,
  UpdateRecipe,
} from '@player-ledger/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  clearBrew,
  createIngredient,
  createRecipe,
  deleteIngredient,
  deleteRecipe,
  logBrewSession,
  logExp,
  startBrew,
  updateBrewingLevel,
  updateIngredient,
  updateRecipe,
} from '@/api/brewing'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

async function unwrap<T>(request: Promise<ApiResponse<T>>): Promise<T> {
  const response = await request
  if (!response.success) throw new ApiError(response.errorCode)
  return response.data
}

/** Every brewing-state endpoint answers with the whole state, so the cache takes it as is. */
function useBrewingStateMutation<TInput>(
  characterId: string,
  name: string,
  request: (input: TInput) => Promise<ApiResponse<BrewingState>>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [name, characterId],
    mutationFn: (input: TInput) => unwrap(request(input)),
    onSuccess: (state) => {
      queryClient.setQueryData(queryKeys.brewing(characterId), state)
    },
  })
}

export function useUpdateBrewingLevel(characterId: string) {
  return useBrewingStateMutation(characterId, 'updateBrewingLevel', (input: UpdateBrewingLevel) =>
    updateBrewingLevel(characterId, input),
  )
}

export function useLogExp(characterId: string) {
  return useBrewingStateMutation(characterId, 'logExp', (amount: number) =>
    logExp(characterId, { amount }),
  )
}

export function useStartBrew(characterId: string) {
  return useBrewingStateMutation(characterId, 'startBrew', (input: StartBrew) =>
    startBrew(characterId, input),
  )
}

export function useLogBrewSession(characterId: string) {
  return useBrewingStateMutation<void>(characterId, 'logBrewSession', () =>
    logBrewSession(characterId),
  )
}

export function useClearBrew(characterId: string) {
  return useBrewingStateMutation<void>(characterId, 'clearBrew', () => clearBrew(characterId))
}

type Row = { id: string }

/**
 * Toggles and steppers are clicked faster than the server answers, so the list is
 * patched first; a failure puts back what the server has.
 */
function useOptimisticRowUpdate<TRow extends Row, TInput>(
  queryKey: readonly unknown[],
  name: string,
  request: (id: string, input: TInput) => Promise<ApiResponse<TRow>>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [name, ...queryKey],
    mutationFn: ({ id, input }: { id: string; input: TInput }) => unwrap(request(id, input)),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey })
      queryClient.setQueryData<TRow[]>(queryKey, (rows) =>
        rows?.map((row) => (row.id === id ? { ...row, ...input } : row)),
      )
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

function useInvalidatingMutation<TInput, TData>(
  queryKey: readonly unknown[],
  name: string,
  request: (input: TInput) => Promise<ApiResponse<TData>>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [name, ...queryKey],
    mutationFn: (input: TInput) => unwrap(request(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

export function useCreateRecipe(characterId: string) {
  return useInvalidatingMutation(
    queryKeys.recipes(characterId),
    'createRecipe',
    (input: CreateRecipe) => createRecipe(characterId, input),
  )
}

export function useUpdateRecipe(characterId: string) {
  return useOptimisticRowUpdate<Recipe, UpdateRecipe>(
    queryKeys.recipes(characterId),
    'updateRecipe',
    (id, input) => updateRecipe(characterId, id, input),
  )
}

export function useDeleteRecipe(characterId: string) {
  return useInvalidatingMutation(queryKeys.recipes(characterId), 'deleteRecipe', (id: string) =>
    deleteRecipe(characterId, id),
  )
}

export function useCreateIngredient(characterId: string) {
  return useInvalidatingMutation(
    queryKeys.ingredients(characterId),
    'createIngredient',
    (input: CreateIngredient) => createIngredient(characterId, input),
  )
}

export function useUpdateIngredient(characterId: string) {
  return useOptimisticRowUpdate<Ingredient, UpdateIngredient>(
    queryKeys.ingredients(characterId),
    'updateIngredient',
    (id, input) => updateIngredient(characterId, id, input),
  )
}

export function useDeleteIngredient(characterId: string) {
  return useInvalidatingMutation(
    queryKeys.ingredients(characterId),
    'deleteIngredient',
    (id: string) => deleteIngredient(characterId, id),
  )
}
