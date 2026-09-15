import type { CreateCharacter, CreateUser } from '@awesomeness-mgmt/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCharacter, createUser } from '@/api/users'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createUser'],
    mutationFn: async (input: CreateUser) => {
      const response = await createUser(input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users(), exact: true })
    },
  })
}

export function useCreateCharacter(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createCharacter', userId],
    mutationFn: async (input: CreateCharacter) => {
      const response = await createCharacter(userId, input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.characters(userId) })
    },
  })
}
