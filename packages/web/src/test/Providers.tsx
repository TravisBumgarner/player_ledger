import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import AppThemeProvider from '@/styles/Theme'

/**
 * The provider stack a component needs when it is rendered outside App.tsx's
 * shell — MUI theme, a router, and a query client.
 */
export function Providers({ children, route = '/' }: { children: ReactNode; route?: string }) {
  // A fresh client per render, so nothing leaks between tests. retry: false —
  // otherwise a failing query burns the test timeout retrying.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AppThemeProvider>{children}</AppThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}
