import { type CharacterProfile, type RichDoc, trimRichDoc } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useUpdateProfile } from '@/hooks/mutations/useProfileMutations'
import { errorMessage } from '@/lib/errorMessages'
import RichTextEditor from '@/sharedComponents/RichTextEditor/RichTextEditor'
import { useMentions } from '@/sharedComponents/RichTextEditor/useMentions'
import TextAction from '@/sharedComponents/TextAction'

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
    <Box component="section" aria-label="Notes" sx={{ display: 'grid', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Typography variant="overline" component="h3">
          Notes
        </Typography>
        {editing ? null : <TextAction onClick={startEditing}>Edit</TextAction>}
      </Box>

      {editing ? (
        <>
          <RichTextEditor
            value={draft}
            onChange={(doc) => setDraft(doc)}
            placeholder="What you know about them..."
            extensions={mentions}
            aria-label={`Notes on ${profile.name}`}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={save} disabled={update.isPending}>
              Save
            </Button>
            <Button onClick={() => setEditing(false)}>Cancel</Button>
            {update.error ? (
              <Typography variant="body2" role="alert">
                {errorMessage(update.error)}
              </Typography>
            ) : null}
          </Box>
        </>
      ) : hasContent(profile.notes) ? (
        <RichTextEditor
          value={profile.notes}
          editable={false}
          extensions={mentions}
          aria-label={`Notes on ${profile.name}`}
        />
      ) : (
        <Typography variant="body2" data-empty="true">
          No notes yet.
        </Typography>
      )}
    </Box>
  )
}
