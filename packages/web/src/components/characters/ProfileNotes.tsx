import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { type CharacterProfile, type RichDoc, trimRichDoc } from '@player-ledger/shared'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import EmptyState from '@/components/ledger/EmptyState'
import SectionHeader from '@/components/ledger/SectionHeader'
import { useUpdateProfile } from '@/hooks/mutations/useProfileMutations'
import { errorMessage } from '@/lib/errorMessages'
import RichTextEditor from '@/sharedComponents/RichTextEditor/RichTextEditor'
import { useMentions } from '@/sharedComponents/RichTextEditor/useMentions'

// Stored notes are trimmed, so an emptied editor comes back with no content at all.
const hasContent = (doc: RichDoc) => (doc.content?.length ?? 0) > 0

export default function ProfileNotes({ profile }: { profile: CharacterProfile }) {
  const { character } = useActiveCharacter()
  const update = useUpdateProfile(character.id)
  const mentions = useMentions()
  const [editing, setEditing] = useState(false)
  // Untrimmed, so it matches what the editor holds and the editor never resyncs mid-edit.
  const [draft, setDraft] = useState<RichDoc | null>(null)

  function startEditing() {
    update.reset()
    // A doc with no content is not one the editor can load; null starts it blank.
    setDraft(hasContent(profile.notes) ? profile.notes : null)
    setEditing(true)
  }

  function save() {
    update.mutate(
      { ref: profile.ref, input: { notes: trimRichDoc(draft ?? { type: 'doc' }) } },
      { onSuccess: () => setEditing(false) },
    )
  }

  return (
    <Box component="section" aria-label="Notes">
      <SectionHeader
        title="Notes"
        right={
          editing ? null : (
            <Button variant="text" onClick={startEditing}>
              Edit
            </Button>
          )
        }
      />

      {editing ? (
        <Box sx={{ display: 'grid', gap: 3 }}>
          <RichTextEditor
            value={draft}
            onChange={(doc) => setDraft(doc)}
            placeholder="What you know about them..."
            toolbar="full"
            extensions={mentions}
            aria-label={`Notes on ${profile.name}`}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={save} disabled={update.isPending}>
              {update.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="quiet" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            {update.error ? (
              <Typography variant="body2" color="error" role="alert">
                {errorMessage(update.error)}
              </Typography>
            ) : null}
          </Box>
        </Box>
      ) : hasContent(profile.notes) ? (
        <RichTextEditor
          value={profile.notes}
          editable={false}
          extensions={mentions}
          aria-label={`Notes on ${profile.name}`}
        />
      ) : (
        <EmptyState>No notes yet.</EmptyState>
      )}
    </Box>
  )
}
