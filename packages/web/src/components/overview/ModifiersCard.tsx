import Typography from '@mui/material/Typography'
import { createModifierSchema } from '@player-ledger/shared'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import AddRow from '@/components/ledger/AddRow'
import Badge from '@/components/ledger/Badge'
import { AnimatePresence, MotionRow } from '@/components/ledger/motion'
import Section from '@/components/ledger/Section'
import {
  useCreateModifier,
  useDeleteModifier,
  useRenameModifier,
} from '@/hooks/mutations/useJournalMutations'
import { useModifiers } from '@/hooks/queries/useJournal'
import { errorMessage } from '@/lib/errorMessages'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import ModifierRow from './ModifierRow'

export default function ModifiersCard() {
  const { character } = useActiveCharacter()
  const modifiers = useModifiers(character.id)
  const createModifier = useCreateModifier(character.id)
  const renameModifier = useRenameModifier(character.id)
  const deleteModifier = useDeleteModifier(character.id)

  const mutationError = createModifier.error ?? renameModifier.error ?? deleteModifier.error

  return (
    <Section
      title="Active modifiers"
      right={modifiers.data ? <Badge>{modifiers.data.length}</Badge> : null}
    >
      {modifiers.isPending ? (
        <Loading size={20} label="Loading modifiers" />
      ) : modifiers.isError ? (
        <LoadFailure
          dense
          error={modifiers.error}
          fallback="Could not load modifiers."
          onRetry={() => void modifiers.refetch()}
        />
      ) : (
        <AnimatePresence initial={false}>
          {modifiers.data.map((modifier) => (
            <MotionRow key={modifier.id}>
              <ModifierRow
                key={modifier.id}
                modifier={modifier}
                disabled={deleteModifier.isPending}
                onRename={(next) => renameModifier.mutate({ modifierId: modifier.id, text: next })}
                onRemove={() => deleteModifier.mutate(modifier.id)}
              />
            </MotionRow>
          ))}
        </AnimatePresence>
      )}
      <AddRow
        placeholder="Add a modifier — blessed, −2 AC until dawn…"
        label="New modifier"
        disabled={createModifier.isPending}
        onAdd={async (text) => {
          const parsed = createModifierSchema.safeParse({ text })
          if (parsed.success) await createModifier.mutateAsync(parsed.data)
        }}
      />
      {mutationError ? (
        <Typography variant="caption" role="alert" sx={{ color: 'error.main' }}>
          {errorMessage(mutationError)}
        </Typography>
      ) : null}
    </Section>
  )
}
