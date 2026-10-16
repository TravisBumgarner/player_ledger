import { createUserSchema } from '@awesomeness-mgmt/shared'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { KeyboardEvent, ReactNode } from 'react'
import AddRow from '@/components/ledger/AddRow'
import Diamond from '@/components/ledger/Diamond'
import RuledRow from '@/components/ledger/RuledRow'
import Section from '@/components/ledger/Section'
import { errorMessage } from '@/lib/errorMessages'

type Named = { id: string; name: string }

export type IdentityPickerProps = {
  heading: string
  fieldLabel: string
  existing: Named[]
  selectedId: string | null
  onPick: (id: string) => void
  /** Resolves to the row the name landed on, which may be one that already existed. */
  onCreate: (name: string) => Promise<Named>
  isCreating: boolean
  createError: unknown
  footer?: ReactNode
}

/** One step of "who are you": pick a name somebody already typed, or add one. */
export default function IdentityPicker({
  heading,
  fieldLabel,
  existing,
  selectedId,
  onPick,
  onCreate,
  isCreating,
  createError,
  footer,
}: IdentityPickerProps) {
  function pickOnKey(event: KeyboardEvent, id: string) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onPick(id)
  }

  return (
    <Box sx={{ display: 'grid', gap: 4, maxWidth: 480, mx: 'auto', pt: 10 }}>
      <Section title={heading}>
        {existing.map((row) => (
          <RuledRow
            key={row.id}
            columns="28px minmax(0, 1fr) 36px"
            role="button"
            tabIndex={0}
            onClick={() => onPick(row.id)}
            onKeyDown={(event) => pickOnKey(event, row.id)}
            sx={{ cursor: 'pointer', '&:hover': { color: 'ledger.accent' } }}
          >
            <Diamond filled={row.id === selectedId} />
            <Typography variant="body1">{row.name}</Typography>
            <ChevronRightIcon fontSize="small" sx={{ color: 'ledger.muted' }} />
          </RuledRow>
        ))}
        <AddRow
          placeholder={`${fieldLabel}…`}
          label={fieldLabel}
          maxLength={80}
          disabled={isCreating}
          onAdd={async (text) => {
            // Users and characters share the same name rule.
            const parsed = createUserSchema.safeParse({ name: text })
            if (!parsed.success) return
            onPick((await onCreate(parsed.data.name)).id)
          }}
        />
      </Section>

      {createError ? (
        <Typography variant="caption" role="alert" sx={{ color: 'error.main' }}>
          {errorMessage(createError)}
        </Typography>
      ) : null}

      {footer}
    </Box>
  )
}
