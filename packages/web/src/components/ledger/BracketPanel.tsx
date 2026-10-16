import Box, { type BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { type ElementType, forwardRef } from 'react'
import { LAYOUT, RADIUS } from '@/theme/tokens'

const arm = LAYOUT.bracketArm

const Frame = styled(Box, { shouldForwardProp: (prop) => prop !== 'active' })<{
  active?: boolean
}>(({ theme, active = false }) => {
  const { panel, line, accent } = theme.palette.ledger
  const bracket = `2px solid ${accent}`
  const corner = (v: 'top' | 'bottom', h: 'left' | 'right') => ({
    [`border${v === 'top' ? 'Top' : 'Bottom'}`]: bracket,
    [`border${h === 'left' ? 'Left' : 'Right'}`]: bracket,
    [v]: -1,
    [h]: -1,
  })
  return {
    position: 'relative',
    backgroundColor: panel,
    border: `1px solid ${active ? accent : line}`,
    borderRadius: RADIUS.badge,
    padding: LAYOUT.cardPadding,
    // Fixed 14px arms, out of flow, so they never take a grid cell or move the content.
    '& > [data-bracket]': { position: 'absolute', width: arm, height: arm, pointerEvents: 'none' },
    '& > [data-bracket="tl"]': corner('top', 'left'),
    '& > [data-bracket="tr"]': corner('top', 'right'),
    '& > [data-bracket="bl"]': corner('bottom', 'left'),
    '& > [data-bracket="br"]': corner('bottom', 'right'),
  }
})

export type BracketPanelProps = BoxProps & {
  component?: ElementType
  /** Accent hairline, for the card being edited. */
  active?: boolean
}

/** The ledger's one frame: panel ground, a hairline, four accent corner brackets. */
// forwardRef: ClickAwayListener and motion both need the element.
const BracketPanel = forwardRef<HTMLElement, BracketPanelProps>(function BracketPanel(
  { children, ...rest },
  ref,
) {
  return (
    <Frame ref={ref} component="section" {...rest}>
      <span aria-hidden="true" data-bracket="tl" />
      <span aria-hidden="true" data-bracket="tr" />
      <span aria-hidden="true" data-bracket="bl" />
      <span aria-hidden="true" data-bracket="br" />
      {children}
    </Frame>
  )
})

export default BracketPanel
