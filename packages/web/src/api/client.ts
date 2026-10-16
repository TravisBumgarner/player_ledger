import { type ApiResponse, log } from '@player-ledger/shared'
import config from '@/config'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
}

export async function apiFetch<T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })

    return (await response.json()) as ApiResponse<T>
  } catch (error) {
    log.error(error instanceof Error ? error : new Error(String(error)), {
      source: 'apiFetch',
      path,
      method,
    })
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}
