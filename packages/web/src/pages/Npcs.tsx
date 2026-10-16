import { type CharacterProfile, createNpcSchema } from '@awesomeness-mgmt/shared'
import Typography from '@mui/material/Typography'
import { profileMeta } from '@/components/characters/CharacterRow'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import AddRow from '@/components/ledger/AddRow'
import EmptyState from '@/components/ledger/EmptyState'
import { AnimatePresence, MotionRow } from '@/components/ledger/motion'
import Page from '@/components/ledger/Page'
import Section from '@/components/ledger/Section'
import ProfileRow from '@/components/npcs/ProfileRow'
import { useCreateNpc, useDeleteProfile } from '@/hooks/mutations/useProfileMutations'
import { useProfiles } from '@/hooks/queries/useProfiles'
import { errorMessage } from '@/lib/errorMessages'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import { useCloseProfile, useOpenProfile, useOpenProfileRef } from '@/store/useCharacterPanelStore'

export default function Npcs() {
  const { character } = useActiveCharacter()
  const profiles = useProfiles(character.id)
  const createNpc = useCreateNpc(character.id)
  const deleteProfile = useDeleteProfile(character.id)
  const openRef = useOpenProfileRef()
  const openProfile = useOpenProfile()
  const closeProfile = useCloseProfile()

  if (profiles.isPending) return <Loading size={20} label="Loading characters" />
  if (profiles.isError) {
    return (
      <LoadFailure
        error={profiles.error}
        fallback="Could not load characters."
        onRetry={() => void profiles.refetch()}
      />
    )
  }

  const party = profiles.data.filter((profile) => profile.kind === 'pc')
  const npcs = profiles.data.filter((profile) => profile.kind === 'npc')
  const mutationError = createNpc.error ?? deleteProfile.error

  function removeNpc(profile: CharacterProfile) {
    deleteProfile.mutate(profile.ref, {
      onSuccess: () => {
        if (openRef === profile.ref) closeProfile()
      },
    })
  }

  return (
    <Page>
      <Section title="NPCs">
        {npcs.length === 0 ? <EmptyState>No NPCs yet.</EmptyState> : null}
        <AnimatePresence initial={false}>
          {npcs.map((profile) => (
            <MotionRow key={profile.ref}>
              <ProfileRow
                profile={profile}
                meta="NPC"
                onOpen={() => openProfile(profile.ref)}
                onRemove={() => removeNpc(profile)}
                disabled={deleteProfile.isPending}
              />
            </MotionRow>
          ))}
        </AnimatePresence>
        <AddRow
          placeholder="Add an NPC…"
          label="New NPC name"
          maxLength={120}
          disabled={createNpc.isPending}
          onAdd={async (name) => {
            const parsed = createNpcSchema.safeParse({ name, description: '' })
            if (!parsed.success) return
            const profile = await createNpc.mutateAsync(parsed.data)
            openProfile(profile.ref)
          }}
        />
        {mutationError ? (
          <Typography variant="caption" role="alert" sx={{ color: 'error.main' }}>
            {errorMessage(mutationError)}
          </Typography>
        ) : null}
      </Section>
      <Section title="Party">
        {party.length === 0 ? <EmptyState>No one in the party yet.</EmptyState> : null}
        {party.map((profile) => (
          <ProfileRow
            key={profile.ref}
            profile={profile}
            meta={profileMeta(profile)}
            onOpen={() => openProfile(profile.ref)}
          />
        ))}
      </Section>
    </Page>
  )
}
