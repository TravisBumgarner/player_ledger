import { type RichDoc, richDocText, trimRichDoc } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useSaveCharacterDevelopment } from '@/hooks/mutations/useJournalMutations'
import { useCharacterDevelopment } from '@/hooks/queries/useJournal'
import { errorMessage } from '@/lib/errorMessages'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import RichTextEditor from '@/sharedComponents/RichTextEditor/RichTextEditor'
import { useMentions } from '@/sharedComponents/RichTextEditor/useMentions'
import SectionLabel from '@/sharedComponents/SectionLabel'
import TextAction from '@/sharedComponents/TextAction'

export default function DevelopmentCard() {
  const { character } = useActiveCharacter()
  const development = useCharacterDevelopment(character.id)
  const save = useSaveCharacterDevelopment(character.id)
  const mentions = useMentions()
  // Untrimmed while editing, so it matches what the editor holds and never resyncs mid-edit.
  const [draft, setDraft] = useState<RichDoc | null>(null)
  const editing = draft !== null

  const saved = development.data?.body
  const hasText = saved ? richDocText(saved).trim().length > 0 : false

  function startEditing() {
    save.reset()
    setDraft(saved ?? { type: 'doc' })
  }

  function handleSave() {
    if (!draft) return
    save.mutate(trimRichDoc(draft), { onSuccess: () => setDraft(null) })
  }

  return (
    <Box component="section" sx={{ display: 'grid', gap: '10px' }}>
      <SectionLabel>Character development</SectionLabel>
      <Paper variant="section" sx={{ display: 'grid', gap: 1 }}>
        {development.isPending ? (
          <Loading size={20} label="Loading character development" />
        ) : development.isError ? (
          <LoadFailure
            dense
            error={development.error}
            fallback="Could not load character development."
            onRetry={() => void development.refetch()}
          />
        ) : editing ? (
          <>
            <RichTextEditor
              value={draft}
              onChange={(doc) => setDraft(doc)}
              extensions={mentions}
              placeholder="Backstory, what drives them, how they have changed..."
              aria-label="Character development"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={handleSave} disabled={save.isPending}>
                Save
              </Button>
              <Button onClick={() => setDraft(null)} disabled={save.isPending}>
                Cancel
              </Button>
              {save.error ? (
                <Typography variant="body2" role="alert">
                  {errorMessage(save.error)}
                </Typography>
              ) : null}
            </Box>
          </>
        ) : (
          <>
            {hasText && saved ? (
              <RichTextEditor
                value={saved}
                editable={false}
                extensions={mentions}
                aria-label="Character development"
              />
            ) : (
              <Typography variant="body2" data-empty="true">
                Nothing written yet — backstory, motivations, how they have grown.
              </Typography>
            )}
            <Box>
              <TextAction onClick={startEditing}>{hasText ? 'Edit' : 'Start writing'}</TextAction>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  )
}
