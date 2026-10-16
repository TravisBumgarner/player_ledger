import type { Character, User } from '@awesomeness-mgmt/shared'
import Button from '@mui/material/Button'
import type { ReactNode } from 'react'
import AppShell from '@/components/AppShell'
import { ActiveCharacterProvider } from '@/components/identity/ActiveCharacter'
import IdentityPicker from '@/components/identity/IdentityPicker'
import { useCreateCharacter, useCreateUser } from '@/hooks/mutations/useCreateIdentity'
import { useCurrentIdentity } from '@/hooks/queries/useIdentity'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import {
  useCharacterId,
  useSetCharacterId,
  useSetUserId,
  useUserId,
} from '@/store/useIdentityStore'

/** Nothing past here renders until there is a user and a character to render it for. */
export default function IdentityGate({ children }: { children: ReactNode }) {
  const { user, character, users, characters } = useCurrentIdentity()

  if (users.isLoading || characters.isLoading) {
    return (
      <AppShell>
        <Loading grow label="Loading" />
      </AppShell>
    )
  }

  const failed = users.isError ? users : characters.isError ? characters : null
  if (failed) {
    return (
      <AppShell>
        <LoadFailure
          error={failed.error}
          fallback="Could not load who is here."
          onRetry={() => void failed.refetch()}
        />
      </AppShell>
    )
  }

  if (!user) {
    return (
      <AppShell>
        <PickUser users={users.data ?? []} />
      </AppShell>
    )
  }

  if (!character) {
    return (
      <AppShell>
        <PickCharacter user={user} characters={characters.data ?? []} />
      </AppShell>
    )
  }

  return <ActiveCharacterProvider value={{ user, character }}>{children}</ActiveCharacterProvider>
}

function PickUser({ users }: { users: User[] }) {
  const userId = useUserId()
  const setUserId = useSetUserId()
  const createUser = useCreateUser()

  return (
    <IdentityPicker
      heading="Who are you?"
      fieldLabel="Add your name"
      existing={users}
      selectedId={userId}
      onPick={setUserId}
      onCreate={(name) => createUser.mutateAsync({ name })}
      isCreating={createUser.isPending}
      createError={createUser.error}
    />
  )
}

function PickCharacter({ user, characters }: { user: User; characters: Character[] }) {
  const characterId = useCharacterId()
  const setUserId = useSetUserId()
  const setCharacterId = useSetCharacterId()
  const createCharacter = useCreateCharacter(user.id)

  return (
    <IdentityPicker
      // Keyed by user, so a half-typed name does not carry over to someone else.
      key={user.id}
      heading={`Who are you playing, ${user.name}?`}
      fieldLabel="Add a character"
      existing={characters}
      selectedId={characterId}
      onPick={setCharacterId}
      onCreate={(name) => createCharacter.mutateAsync({ name })}
      isCreating={createCharacter.isPending}
      createError={createCharacter.error}
      footer={
        <Button variant="text" onClick={() => setUserId(null)} sx={{ justifySelf: 'start' }}>
          {`Not ${user.name}? Change user`}
        </Button>
      }
    />
  )
}
