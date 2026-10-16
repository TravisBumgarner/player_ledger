import Box from '@mui/material/Box'
import { useLocation, useOutlet } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import CharacterPanel from '@/components/characters/CharacterPanel'
import ProfilePortraitEditor from '@/components/characters/ProfilePortraitEditor'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { AnimatePresence, motion } from '@/components/ledger/motion'
import Portrait from '@/components/ledger/Portrait'
import SideNav from '@/components/ledger/SideNav'
import RestToolbar from '@/components/rest/RestToolbar'
import { useProfiles } from '@/hooks/queries/useProfiles'
import { profileImageUrl } from '@/sharedComponents/ProfileImage'
import { LAYOUT } from '@/theme/tokens'

export default function LedgerLayout() {
  const { character } = useActiveCharacter()
  const profiles = useProfiles(character.id)
  const own = profiles.data?.find((profile) => profile.ref === `pc:${character.id}`)
  const { pathname } = useLocation()
  // Captured per render, so the leaving page keeps showing itself while it fades out.
  const outlet = useOutlet()

  return (
    <AppShell ledger headerActions={<RestToolbar />}>
      <Box
        component="aside"
        sx={{
          width: LAYOUT.sidebarWidth,
          flex: 'none',
          boxSizing: 'border-box',
          px: 4,
          py: 5,
          borderRight: 1,
          borderColor: 'ledger.line',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          overflowY: 'auto',
        }}
      >
        <Portrait
          name={character.name}
          title={own?.description ?? ''}
          imageUrl={own ? profileImageUrl(character.id, own) : null}
          editor={
            own ? <ProfilePortraitEditor profile={own} size={LAYOUT.portrait.w} /> : undefined
          }
        />
        <SideNav />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto', pt: 6, px: 8, pb: 12 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </Box>

      <CharacterPanel />
    </AppShell>
  )
}
