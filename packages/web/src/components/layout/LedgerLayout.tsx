import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Link, Outlet, useLocation } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import RestToolbar from '@/components/rest/RestToolbar'
import { LEDGER_TABS } from '@/lib/routes'
import { LEDGER_CONTENT_WIDTH, SIDEBAR_WIDTH } from '@/styles/styleConsts'

export default function LedgerLayout() {
  const { pathname } = useLocation()
  const theme = useTheme()
  // Below this the sidebar would squeeze the tables, so it becomes a row of tabs.
  const stacked = useMediaQuery(theme.breakpoints.down('sm'))
  const active = LEDGER_TABS.find((tab) => pathname.startsWith(tab.path))?.path ?? false

  return (
    <AppShell wide>
      <RestToolbar />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: stacked ? 'column' : 'row',
          minHeight: 0,
        }}
      >
        <Tabs
          component="nav"
          aria-label="Ledger sections"
          orientation={stacked ? 'horizontal' : 'vertical'}
          variant={stacked ? 'scrollable' : 'standard'}
          value={active}
          sx={stacked ? undefined : { width: SIDEBAR_WIDTH, flex: 'none', pt: 2 }}
        >
          {LEDGER_TABS.map((tab) => (
            <Tab key={tab.path} value={tab.path} label={tab.label} component={Link} to={tab.path} />
          ))}
        </Tabs>

        <Box
          component="section"
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 2, sm: 4.5 },
            py: { xs: 2, sm: 3.5 },
            maxWidth: LEDGER_CONTENT_WIDTH,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </AppShell>
  )
}
