import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { Link, useLocation } from 'react-router-dom'
import { LEDGER_TABS } from '@/lib/routes'
import { LAYOUT, TYPE } from '@/theme/tokens'
import Diamond from './Diamond'
import { EASE, motion, SLOW } from './motion'

const NavItem = styled(Link)(({ theme }) => ({
  ...TYPE.capsSm,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  minHeight: LAYOUT.navRowHeight,
  padding: '4px 0',
  boxSizing: 'border-box',
  textDecoration: 'none',
  color: theme.palette.ledger.muted,
  transition: 'color 160ms ease-out',
  borderBottom: `1px solid ${theme.palette.ledger.line}`,
  '&:hover, &[aria-current="page"]': { color: theme.palette.ledger.text },
}))

export default function SideNav() {
  const { pathname } = useLocation()

  return (
    <Box
      component="nav"
      aria-label="Sections"
      sx={{ display: 'flex', flexDirection: 'column', borderTop: 1, borderColor: 'ledger.line' }}
    >
      {LEDGER_TABS.map((tab) => {
        const active = pathname.startsWith(tab.path)
        return (
          <NavItem key={tab.path} to={tab.path} aria-current={active ? 'page' : undefined}>
            <Box sx={{ position: 'relative', display: 'flex', flex: 'none' }}>
              <Diamond />
              {active ? (
                <motion.span
                  layoutId="nav-active"
                  style={{ position: 'absolute', inset: 0, display: 'flex' }}
                  transition={{ duration: SLOW, ease: EASE }}
                >
                  <Diamond filled />
                </motion.span>
              ) : null}
            </Box>
            {tab.label}
          </NavItem>
        )
      })}
    </Box>
  )
}
