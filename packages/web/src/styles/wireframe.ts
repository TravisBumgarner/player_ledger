import { useColorScheme } from '@mui/material/styles'
import { WIREFRAME_TOKENS, type WireframeTokens } from './Theme'

function activeScheme(mode: string | undefined, systemMode: string | undefined): 'light' | 'dark' {
  const resolved = mode === 'system' || mode === undefined ? systemMode : mode
  return resolved === 'dark' ? 'dark' : 'light'
}

/**
 * A canvas paints with literal strings, so a `var(--mui-palette-…)` reaching it
 * draws nothing. This hands it the same tokens as resolved values.
 */
export function useCanvasTokens(): WireframeTokens {
  const { mode, systemMode } = useColorScheme()
  return WIREFRAME_TOKENS[activeScheme(mode, systemMode)]
}
