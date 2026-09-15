import { log } from '@awesomeness-mgmt/shared'
import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

const RELOAD_FLAG = 'chunk-error-reloaded'

function isChunkLoadError(error: Error): boolean {
  return (
    error.name === 'ChunkLoadError' ||
    /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
      error.message,
    )
  )
}

/** A failed dynamic import means a stale index.html naming chunks a deploy removed; reload once. */
export default class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    if (!isChunkLoadError(error)) throw error

    // Guard against a reload loop when the chunk is genuinely gone.
    if (sessionStorage.getItem(RELOAD_FLAG)) {
      log.error(error, { source: 'ChunkErrorBoundary', note: 'reload did not resolve' })
      return
    }
    sessionStorage.setItem(RELOAD_FLAG, '1')
    window.location.reload()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
