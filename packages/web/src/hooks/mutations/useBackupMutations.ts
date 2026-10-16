import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBackup, getBackups, restoreBackup } from '@/api/backup'
import { ApiError } from '@/lib/ApiError'

const BACKUPS_KEY = ['backups'] as const

export function useBackups(enabled: boolean) {
  return useQuery({
    queryKey: BACKUPS_KEY,
    enabled,
    queryFn: async () => {
      const response = await getBackups()
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
  })
}

export function useCreateBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['createBackup'],
    mutationFn: async () => {
      const response = await createBackup()
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: BACKUPS_KEY }),
  })
}

export function useRestoreBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['restoreBackup'],
    mutationFn: async (name: string) => {
      const response = await restoreBackup({ name })
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    // Every row may have changed, so nothing cached can be trusted.
    onSuccess: () => void queryClient.invalidateQueries(),
  })
}
