import { useQuery } from '@tanstack/react-query'
import { getBrewingState, getIngredients, getRecipes } from '@/api/brewing'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useBrewingState(characterId: string) {
  return useQuery({
    queryKey: queryKeys.brewing(characterId),
    queryFn: async () => {
      const response = await getBrewingState(characterId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}

export function useRecipes(characterId: string) {
  return useQuery({
    queryKey: queryKeys.recipes(characterId),
    queryFn: async () => {
      const response = await getRecipes(characterId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}

export function useIngredients(characterId: string) {
  return useQuery({
    queryKey: queryKeys.ingredients(characterId),
    queryFn: async () => {
      const response = await getIngredients(characterId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}
