import Box from '@mui/material/Box'
import { log } from '@player-ledger/shared'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'
import ChunkErrorBoundary from '@/components/ChunkErrorBoundary'
import ErrorBoundary from '@/components/ErrorBoundary'
import ErrorScreen from '@/components/ErrorScreen'
import IdentityGate from '@/components/identity/IdentityGate'
import LedgerLayout from '@/components/layout/LedgerLayout'
import { useHealthCheck } from '@/hooks/useHealthCheck'
import { ROUTES } from '@/lib/routes'
import Brewing from '@/pages/Brewing'
import CharacterDevelopment from '@/pages/CharacterDevelopment'
import Combat from '@/pages/Combat'
import Grafting from '@/pages/Grafting'
import Inventory from '@/pages/Inventory'
import NotFound from '@/pages/NotFound'
import Npcs from '@/pages/Npcs'
import SessionNotes from '@/pages/SessionNotes'
import Loading from '@/sharedComponents/Loading'
import AppThemeProvider from '@/theme'

// Module scope: one QueryClient for the app's lifetime.
export const queryClient = new QueryClient({
  // Without these, a failed query is completely silent.
  queryCache: new QueryCache({
    onError: (error, query) => {
      log.error(error, { queryKey: JSON.stringify(query.queryKey) })
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      log.error(error, { mutationKey: JSON.stringify(mutation.options.mutationKey ?? 'unknown') })
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: 0 },
  },
})

function BackendUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorScreen
      title="Cannot reach the server"
      detail="It may still be starting up. Nothing you have done is lost."
      action={{ label: 'Retry', onAction: onRetry }}
    />
  )
}

function AppRoutes() {
  const { isBackendAvailable, isChecking, retry } = useHealthCheck()

  if (isChecking) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <Loading grow label="Connecting" />
      </Box>
    )
  }

  if (!isBackendAvailable) return <BackendUnavailable onRetry={() => void retry()} />

  return (
    <IdentityGate>
      <Routes>
        <Route path={ROUTES.home} element={<Navigate to={ROUTES.sessionNotes} replace />} />
        <Route element={<LedgerLayout />}>
          <Route path={ROUTES.combat} element={<Combat />} />
          <Route path={ROUTES.inventory} element={<Inventory />} />
          <Route path={ROUTES.brewing} element={<Brewing />} />
          <Route path={ROUTES.grafting} element={<Grafting />} />
          <Route path={ROUTES.npcs} element={<Npcs />} />
          <Route path={ROUTES.sessionNotes} element={<SessionNotes />} />
          <Route path={ROUTES.development} element={<CharacterDevelopment />} />
        </Route>
        {/* A dead address says so rather than bouncing home, which reads as the
          link having worked. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </IdentityGate>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ChunkErrorBoundary>
            <AppRoutes />
          </ChunkErrorBoundary>
        </QueryClientProvider>
      </AppThemeProvider>
    </ErrorBoundary>
  )
}
