import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { CharacterProfile } from '@player-ledger/shared'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useDeleteProfile } from '@/hooks/mutations/useProfileMutations'
import { errorMessage } from '@/lib/errorMessages'
import TextAction from '@/sharedComponents/TextAction'

export type DeleteNpcActionProps = {
  profile: CharacterProfile
  onDeleted: () => void
}

export default function DeleteNpcAction({ profile, onDeleted }: DeleteNpcActionProps) {
  const { character } = useActiveCharacter()
  const deleteProfile = useDeleteProfile(character.id)

  return (
    <Box sx={{ display: 'grid', gap: 1, justifyItems: 'start' }}>
      <TextAction
        disabled={deleteProfile.isPending}
        onClick={() => deleteProfile.mutate(profile.ref, { onSuccess: onDeleted })}
      >
        Delete NPC
      </TextAction>
      {deleteProfile.error ? (
        <Typography variant="body2" role="alert">
          {errorMessage(deleteProfile.error)}
        </Typography>
      ) : null}
    </Box>
  )
}
