import type { CharacterProfile } from '@awesomeness-mgmt/shared'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { AnimatePresence, EASE, motion, SLOW } from '@/components/ledger/motion'
import { useProfiles } from '@/hooks/queries/useProfiles'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import { useCloseProfile, useOpenProfile, useOpenProfileRef } from '@/store/useCharacterPanelStore'
import { LAYOUT } from '@/theme/tokens'
import { profileMeta } from './CharacterRow'
import DeleteNpcAction from './DeleteNpcAction'
import ProfileBacklinks from './ProfileBacklinks'
import ProfileDescription from './ProfileDescription'
import ProfileNotes from './ProfileNotes'
import ProfilePortraitEditor from './ProfilePortraitEditor'

/**
 * Docked beside the page from `md` up, so a session note and a character can be
 * edited side by side. Narrower, there is no room for a column and it overlays.
 */
export default function CharacterPanel() {
  const openRef = useOpenProfileRef()
  const closeProfile = useCloseProfile()
  const theme = useTheme()
  const docked = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })
  const wide = useMediaQuery(theme.breakpoints.up('lg'), { noSsr: true })

  if (docked) {
    const width = wide ? 380 : 340
    return (
      <AnimatePresence initial={false}>
        {openRef ? (
          <motion.div
            key="panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: SLOW, ease: EASE }}
            style={{ flex: 'none', marginLeft: 'auto', overflow: 'hidden', display: 'flex' }}
          >
            <Paper
              component="aside"
              aria-label="Character"
              variant="panelBody"
              data-edge="left"
              square
              // Fixed width inside the growing wrapper, so text never reflows while it opens.
              sx={{ width, flex: 'none', overflowY: 'auto' }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={openRef}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                >
                  <PanelBody profileRef={openRef} />
                </motion.div>
              </AnimatePresence>
            </Paper>
          </motion.div>
        ) : null}
      </AnimatePresence>
    )
  }

  return (
    <Drawer
      anchor="right"
      open={openRef !== null}
      onClose={closeProfile}
      slotProps={{
        paper: {
          variant: 'panelBody',
          component: 'aside',
          'aria-label': 'Character',
          sx: { width: { xs: '100%', sm: 420 } },
        },
      }}
    >
      {openRef ? <PanelBody key={openRef} profileRef={openRef} /> : null}
    </Drawer>
  )
}

function PanelBody({ profileRef }: { profileRef: string }) {
  const { character } = useActiveCharacter()
  const profiles = useProfiles(character.id)
  const closeProfile = useCloseProfile()
  const profile = profiles.data?.find((row) => row.ref === profileRef)

  return (
    <Box sx={{ display: 'grid', gap: 8, alignContent: 'start', p: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="capsXs">{profile ? profileMeta(profile) : 'Character'}</Typography>
        <IconButton aria-label="Close" onClick={closeProfile} sx={{ my: -2, mr: -2 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {profiles.isPending ? (
        <Loading size={20} label="Loading character" />
      ) : profiles.isError ? (
        <LoadFailure
          dense
          error={profiles.error}
          fallback="Could not load this character."
          onRetry={() => void profiles.refetch()}
        />
      ) : profile ? (
        <ProfileDetails profile={profile} />
      ) : (
        <Box sx={{ display: 'grid', gap: 3, justifyItems: 'start' }}>
          <Typography variant="bodySm" data-empty="true">
            That character is no longer here.
          </Typography>
          <Button variant="quiet" onClick={closeProfile} sx={{ ml: -2 }}>
            Close
          </Button>
        </Box>
      )}
    </Box>
  )
}

function ProfileDetails({ profile }: { profile: CharacterProfile }) {
  const openProfile = useOpenProfile()
  const closeProfile = useCloseProfile()

  return (
    <>
      <Box sx={{ display: 'grid', gap: 5, justifyItems: 'center', mt: -4 }}>
        <ProfilePortraitEditor profile={profile} size={LAYOUT.portrait.w} />
        <Box sx={{ display: 'grid', gap: 1, justifySelf: 'stretch' }}>
          <Typography
            variant="title"
            component="h2"
            sx={{ color: 'ledger.accent', textAlign: 'center' }}
          >
            {profile.name}
          </Typography>
          <ProfileDescription profile={profile} align="center" />
        </Box>
      </Box>
      <ProfileNotes profile={profile} />
      <ProfileBacklinks profileRef={profile.ref} onOpenProfile={openProfile} />
      {profile.kind === 'npc' ? (
        <DeleteNpcAction profile={profile} onDeleted={closeProfile} />
      ) : null}
    </>
  )
}
