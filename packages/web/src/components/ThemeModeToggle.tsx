import { useColorScheme } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

// MUI's three modes, relabelled: 'system' is what a person calls Auto.
const OPTIONS = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'system', label: 'Auto' },
] as const

// Kept device-local: the theme has to apply before the first paint, and a round-trip cannot.
export default function ThemeModeToggle({ fullWidth = false }: { fullWidth?: boolean }) {
  const { mode, setMode } = useColorScheme()

  return (
    <ToggleButtonGroup
      fullWidth={fullWidth}
      exclusive
      size="small"
      value={mode ?? 'system'}
      aria-label="Colour theme"
      onChange={(_event, next) => {
        // null is the already-selected button being clicked again.
        if (next) setMode(next)
      }}
    >
      {OPTIONS.map((option) => (
        <ToggleButton key={option.mode} value={option.mode}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
