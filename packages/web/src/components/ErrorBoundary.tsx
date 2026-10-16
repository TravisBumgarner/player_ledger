import { log } from '@awesomeness-mgmt/shared'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import ErrorScreen from '@/components/ErrorScreen'
import AppThemeProvider from '@/theme'

type Props = { children: ReactNode }
type State = { hasError: boolean }

/** Outermost, so the fallback carries its own theme rather than one it may have just outlived. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    log.error(error, { componentStack: info.componentStack ?? undefined })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <AppThemeProvider>
        <ErrorScreen
          title="Something broke"
          detail="Reloading usually clears it."
          action={{ label: 'Reload', onAction: () => window.location.reload() }}
        />
      </AppThemeProvider>
    )
  }
}
