import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import AppHeader from '@/components/AppHeader'
import { SPACING } from '@/styles/styleConsts'

/** As wide as a form wants to be, which is narrower than any other screen. */
const FORM_WIDTH = 400

/**
 * A floor rather than a fixed height, so a form that runs long still fits, and
 * short screens do not sit higher than tall ones when walked between.
 */
const FORM_MIN_HEIGHT = 520

export type PageWrapperProps = {
  children: ReactNode
  header?: boolean
}

/** One column of form, held in the middle of the window under the header. */
export default function PageWrapper({ children, header = true }: PageWrapperProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {header ? <AppHeader /> : null}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: SPACING.page,
        }}
      >
        <Box
          component="main"
          sx={{ width: '100%', maxWidth: FORM_WIDTH, minHeight: FORM_MIN_HEIGHT }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
