import type {
  CreateGoal,
  CreateModifier,
  CreateSessionNote,
  Goal,
  Modifier,
  NoteKind,
  SessionNote,
  UpdateSessionNote,
} from '@awesomeness-mgmt/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createGoal,
  createModifier,
  createNote,
  deleteGoal,
  deleteModifier,
  deleteNote,
  updateGoal,
  updateModifier,
  updateNote,
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

export function useCreateModifier(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createModifier', characterId],
    mutationFn: async (input: CreateModifier) => {
      const response = await createModifier(characterId, input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: (modifier) => {
      queryClient.setQueryData<Modifier[]>(queryKeys.modifiers(characterId), (rows) =>
        rows ? [...rows, modifier] : rows,
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.modifiers(characterId) })
    },
  })
}

export function useRenameModifier(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['renameModifier', characterId],
    mutationFn: async ({ modifierId, text }: { modifierId: string; text: string }) => {
      const response = await updateModifier(characterId, modifierId, { text })
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    // Renamed on commit, or the old title flashes back while the request is out.
    onMutate: ({ modifierId, text }) => {
      void queryClient.cancelQueries({ queryKey: queryKeys.modifiers(characterId) })
      queryClient.setQueryData<Modifier[]>(queryKeys.modifiers(characterId), (rows) =>
        rows?.map((row) => (row.id === modifierId ? { ...row, text } : row)),
      )
    },
    onSuccess: (modifier) => {
      queryClient.setQueryData<Modifier[]>(queryKeys.modifiers(characterId), (rows) =>
        rows?.map((row) => (row.id === modifier.id ? modifier : row)),
      )
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.modifiers(characterId) })
    },
  })
}

export function useDeleteModifier(characterId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteModifier', characterId],
    mutationFn: async (modifierId: string) => {
      const response = await deleteModifier(characterId, modifierId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.modifiers(characterId) })
    },
  })
}

export function useCreateNote(characterId: string, kind: NoteKind) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createNote', characterId, kind],
    mutationFn: async (input: CreateSessionNote) => {
      const response = await createNote(characterId, kind, input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: (note) => {
      queryClient.setQueryData<SessionNote[]>(queryKeys.notes(characterId, kind), (rows) =>
        rows ? [note, ...rows] : rows,
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes(characterId, kind) })
      // Mentions live in note bodies, so backlinks move with them.
      void queryClient.invalidateQueries({ queryKey: queryKeys.profiles(characterId) })
    },
  })
}

export function useUpdateNote(characterId: string, kind: NoteKind) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateNote', characterId, kind],
    // Autosave fires often; queued, an older body can never land after a newer one.
    scope: { id: `updateNote:${characterId}:${kind}` },
    mutationFn: async ({ noteId, input }: { noteId: string; input: UpdateSessionNote }) => {
      const response = await updateNote(characterId, kind, noteId, input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: (note) => {
      queryClient.setQueryData<SessionNote[]>(queryKeys.notes(characterId, kind), (rows) =>
        rows?.map((row) => (row.id === note.id ? note : row)),
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.profiles(characterId) })
    },
  })
}

export function useDeleteNote(characterId: string, kind: NoteKind) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteNote', characterId, kind],
    mutationFn: async (noteId: string) => {
      const response = await deleteNote(characterId, kind, noteId)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes(characterId, kind) })
      // Mentions live in note bodies, so backlinks move with them.
      void queryClient.invalidateQueries({ queryKey: queryKeys.profiles(characterId) })
    },
  })
}
