import type { CharacterProfile } from '@awesomeness-mgmt/shared'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useProfiles } from '@/hooks/queries/useProfiles'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import TextAction from '@/sharedComponents/TextAction'
import { useCloseProfile, useOpenProfile, useOpenProfileRef } from '@/store/useCharacterPanelStore'
import { profileMeta } from './CharacterRow'
import DeleteNpcAction from './DeleteNpcAction'
import ProfileBacklinks from './ProfileBacklinks'
import ProfileDescription from './ProfileDescription'
import ProfileNotes from './ProfileNotes'
import ProfilePortraitEditor from './ProfilePortraitEditor'

/** The sticky app bar: a 40px toolbar and its 1px rule. The docked panel pins beneath it. */
const APP_BAR_HEIGHT = 41
const PORTRAIT_SIZE = 200

/**
 * Docked beside the page from `md` up, so a session note and a character can be
 * edited side by side. Narrower, there is no room for a column and it overlays.
 */
export default function CharacterPanel() {
  const openRef = useOpenProfileRef()
  const closeProfile = useCloseProfile()
  const theme = useTheme()
  const docked = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })

  if (docked) {
    if (!openRef) return null
    return (
      <Paper
        component="aside"
        aria-label="Character"
        variant="panelBody"
        data-edge="left"
        square
        sx={{
          width: { md: 340, lg: 380 },
          flex: 'none',
          ml: 'auto',
          alignSelf: 'flex-start',
          position: 'sticky',
          top: APP_BAR_HEIGHT,
          height: `calc(100dvh - ${APP_BAR_HEIGHT}px)`,
          overflowY: 'auto',
        }}
      >
        <PanelBody key={openRef} profileRef={openRef} />
      </Paper>
    )
  }

  return (
    <Drawer
      anchor="right"
      open={openRef !== null}
      onClose={closeProfile}
      slotProps={{
        paper: {
          variant: 'modal',
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
    <Box sx={{ display: 'grid', gap: 2, alignContent: 'start', p: '14px 18px 24px' }}>
      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
      >
        {profile ? (
          <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0, pt: 0.5 }}>
            <Typography variant="h4" component="h2">
              {profile.name}
            </Typography>
            <Typography variant="caption">{profileMeta(profile)}</Typography>
          </Box>
        ) : (
          <Box />
        )}
        <IconButton aria-label="Close" onClick={closeProfile} sx={{ mr: -1, mt: -0.5 }}>
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
        <Box sx={{ display: 'grid', gap: 1, justifyItems: 'start' }}>
          <Typography variant="body2" data-empty="true">
            That character is no longer here.
          </Typography>
          <TextAction onClick={closeProfile}>Close</TextAction>
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
      <ProfilePortraitEditor profile={profile} size={PORTRAIT_SIZE} />
      <ProfileDescription profile={profile} />
      <Divider />
      <ProfileNotes profile={profile} />
      <Divider />
      <ProfileBacklinks profileRef={profile.ref} onOpenProfile={openProfile} />
      {profile.kind === 'npc' ? (
        <>
          <Divider />
          <DeleteNpcAction profile={profile} onDeleted={closeProfile} />
        </>
      ) : null}
    </>
  )
}
