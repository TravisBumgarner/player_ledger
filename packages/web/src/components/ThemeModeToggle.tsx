import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { usePalette } from '@/theme'
import type { PaletteName } from '@/theme/tokens'

const OPTIONS: { name: PaletteName; label: string }[] = [
  { name: 'grove', label: 'Grove' },
  { name: 'neutral', label: 'Neutral' },
]

// Kept device-local: the palette has to apply before the first paint, and a round-trip cannot.
export default function ThemeModeToggle({ fullWidth = false }: { fullWidth?: boolean }) {
  const { palette, setPalette } = usePalette()

  return (
    <ToggleButtonGroup
      fullWidth={fullWidth}
      exclusive
      size="small"
      value={palette}
      aria-label="Palette"
      onChange={(_event, next: PaletteName | null) => {
        if (next) setPalette(next)
      }}
    >
      {OPTIONS.map((option) => (
        <ToggleButton key={option.name} value={option.name}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
