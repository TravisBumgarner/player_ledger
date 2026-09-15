import type { CreateGoal, CreateSessionNote, Goal, SessionNote } from '@awesomeness-mgmt/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createGoal,
  createSessionNote,
  deleteGoal,
  deleteSessionNote,
  updateGoal,
} from '@/api/journal'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useCreateGoal(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createGoal', characterId],
    mutationFn: async (input: CreateGoal) => {
      const response = await createGoal(characterId, input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: (goal) => {
      queryClient.setQueryData<Goal[]>(queryKeys.goals(characterId), (rows) =>
        rows ? [...rows, goal] : rows,
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals(characterId) })
    },
  })
}

export function useToggleGoal(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['toggleGoal', characterId],
    mutationFn: async ({ goalId, done }: { goalId: string; done: boolean }) => {
      const response = await updateGoal(characterId, goalId, { done })
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    // Ticked on click: a checkbox that waits for the server reads as a missed click.
    onMutate: ({ goalId, done }) => {
      void queryClient.cancelQueries({ queryKey: queryKeys.goals(characterId) })
      queryClient.setQueryData<Goal[]>(queryKeys.goals(characterId), (rows) =>
        rows?.map((row) => (row.id === goalId ? { ...row, done } : row)),
      )
    },
    onSuccess: (goal) => {
      queryClient.setQueryData<Goal[]>(queryKeys.goals(characterId), (rows) =>
        rows?.map((row) => (row.id === goal.id ? goal : row)),
      )
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals(characterId) })
    },
  })
}

export function useDeleteGoal(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteGoal', characterId],
    mutationFn: async (goalId: string) => {
      const response = await deleteGoal(characterId, goalId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals(characterId) })
    },
  })
}

export function useCreateSessionNote(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createSessionNote', characterId],
    mutationFn: async (input: CreateSessionNote) => {
      const response = await createSessionNote(characterId, input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: (note) => {
      queryClient.setQueryData<SessionNote[]>(queryKeys.sessionNotes(characterId), (rows) =>
        rows ? [note, ...rows] : rows,
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessionNotes(characterId) })
    },
  })
}

export function useDeleteSessionNote(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteSessionNote', characterId],
    mutationFn: async (noteId: string) => {
      const response = await deleteSessionNote(characterId, noteId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessionNotes(characterId) })
    },
  })
}
