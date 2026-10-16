import type { CharacterProfile, CreateNpc, UpdateProfile } from '@player-ledger/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createNpc,
  deleteProfile,
  deleteProfileImage,
  updateProfile,
  uploadProfileImage,
} from '@/api/profiles'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

/** Profiles and every backlink list share this prefix; a notes edit can change either. */
function useInvalidateProfiles(characterId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.profiles(characterId) })
}

export function useCreateNpc(characterId: string) {
  const invalidate = useInvalidateProfiles(characterId)

  return useMutation({
    mutationKey: ['createNpc', characterId],
    mutationFn: async (input: CreateNpc) => {
      const response = await createNpc(characterId, input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    // Awaited, so the new NPC is in the list by the time the caller expands it.
    onSuccess: () => invalidate(),
  })
}

export function useUpdateProfile(characterId: string) {
  const invalidate = useInvalidateProfiles(characterId)

  return useMutation({
    mutationKey: ['updateProfile', characterId],
    mutationFn: async ({ ref, input }: { ref: string; input: UpdateProfile }) => {
      const response = await updateProfile(characterId, ref, input)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: () => invalidate(),
  })
}

export function useDeleteProfile(characterId: string) {
  const invalidate = useInvalidateProfiles(characterId)

  return useMutation({
    mutationKey: ['deleteProfile', characterId],
    mutationFn: async (ref: string) => {
      const response = await deleteProfile(characterId, ref)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    // Not awaited, so the caller lets go of the row before the refetch drops it.
    onSettled: () => {
      void invalidate()
    },
  })
}

/** Writes the returned profile in straight away, so the new portrait shows without waiting on a refetch. */
function useReplaceProfile(characterId: string) {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateProfiles(characterId)
  return (profile: CharacterProfile) => {
    queryClient.setQueryData<CharacterProfile[]>(queryKeys.profiles(characterId), (list) =>
      list?.map((row) => (row.ref === profile.ref ? profile : row)),
    )
    void invalidate()
  }
}

export function useUploadProfileImage(characterId: string) {
  const replace = useReplaceProfile(characterId)

  return useMutation({
    mutationKey: ['uploadProfileImage', characterId],
    mutationFn: async ({ ref, image }: { ref: string; image: Blob }) => {
      const response = await uploadProfileImage(characterId, ref, image)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: replace,
  })
}

export function useDeleteProfileImage(characterId: string) {
  const replace = useReplaceProfile(characterId)

  return useMutation({
    mutationKey: ['deleteProfileImage', characterId],
    mutationFn: async (ref: string) => {
      const response = await deleteProfileImage(characterId, ref)
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: replace,
  })
}
