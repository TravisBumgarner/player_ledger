import type { Health } from '@awesomeness-mgmt/shared'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/api/client'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

/** The health route sits before rate limits on the server. */
export function useHealthCheck() {
  const query = useQuery({
    queryKey: queryKeys.health(),
    queryFn: async () => {
      const response = await apiFetch<Health>('/health')
      if (!response.success) throw new ApiError(response.errorCode)
      return response.data
    },
    retry: 1,
    refetchInterval: 30_000,
    staleTime: 0,
  })

  return {
    // Once one check has answered, a later failure is not a reason to unmount the page somebody is working on.
    isBackendAvailable: !query.isError || query.data !== undefined,
    isChecking: query.isLoading,
    retry: query.refetch,
  }
}
