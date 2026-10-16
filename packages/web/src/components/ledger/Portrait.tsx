import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import treant from '@/assets/treant.jpg'
import { LAYOUT, RADIUS } from '@/theme/tokens'

const Frame = styled('div')(({ theme }) => ({
  width: LAYOUT.portrait.w,
  padding: 5,
  boxSizing: 'border-box',
  border: `1px solid ${theme.palette.ledger.line2}`,
  borderRadius: `${RADIUS.portraitTop}px ${RADIUS.portraitTop}px ${RADIUS.portraitBottom}px ${RADIUS.portraitBottom}px`,
  '& img': {
    display: 'block',
    width: '100%',
    height: LAYOUT.portrait.h,
    objectFit: 'cover',
    objectPosition: '50% 15%',
    borderRadius: `${RADIUS.portraitTop - 5}px ${RADIUS.portraitTop - 5}px ${RADIUS.badge}px ${RADIUS.badge}px`,
  },
}))

export default function Portrait({
  name,
  title,
  imageUrl,
  editor,
}: {
  name: string
  title: string
  imageUrl: string | null
  /** The hover Replace/Remove frame, when the portrait can be edited here. */
  editor?: ReactNode
}) {
  return (
    <Box
      component="figure"
      sx={{ m: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
    >
      {editor ?? (
        <Frame>
          <img src={imageUrl ?? treant} alt={`Portrait of ${name}`} />
        </Frame>
      )}
      <Box component="figcaption" sx={{ textAlign: 'center' }}>
        <Typography
          variant="title"
          component="div"
          sx={{ color: 'ledger.accent', letterSpacing: '0.08em' }}
        >
          {name}
        </Typography>
        <Typography
          variant="bodySm"
          component="div"
          sx={{ fontStyle: 'italic', color: 'ledger.muted' }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  )
}
