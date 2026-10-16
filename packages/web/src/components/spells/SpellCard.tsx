import type { Spell } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import Badge from '@/components/ledger/Badge'
import Diamond from '@/components/ledger/Diamond'
import { AnimatePresence, motion } from '@/components/ledger/motion'
import RuledRow from '@/components/ledger/RuledRow'
import { useCastSpell, useUpdateSpell } from '@/hooks/mutations/useSpellMutations'
import { errorMessage } from '@/lib/errorMessages'

const RESET_WORD: Record<Spell['resetOn'], string> = { short: 'short rest', long: 'long rest' }

export type SpellCardProps = {
  spell: Spell
  onEdit?: () => void
}

/** One line per spell, so a dozen fit on screen; the description opens on click. */
export default function SpellCard({ spell, onEdit }: SpellCardProps) {
  const { character } = useActiveCharacter()
  const update = useUpdateSpell(character.id)
  const cast = useCastSpell(character.id)
  const [open, setOpen] = useState(false)

  const remaining = spell.slotsTotal - spell.slotsUsed
  const failure = update.error ?? cast.error

  return (
    <RuledRow columns="28px 40px minmax(0, 1fr) 112px 72px 64px" sx={{ py: 2, rowGap: 2 }}>
      <Tooltip title="Prepared">
        <Checkbox
          checked={spell.prepared}
          onChange={(event) =>
            update.mutate({ spellId: spell.id, input: { prepared: event.target.checked } })
          }
          inputProps={{ 'aria-label': `${spell.name} prepared` }}
          sx={{ p: 0 }}
        />
      </Tooltip>

      <Tooltip title={`Level ${spell.level}`}>
        <Badge>{spell.level}</Badge>
      </Tooltip>

      <Box
        component="button"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        sx={{
          all: 'unset',
          minWidth: 0,
          cursor: 'pointer',
          display: 'grid',
          '&:hover .spell-name': { color: 'ledger.accent' },
        }}
      >
        <Typography variant="body1" className="spell-name" noWrap sx={{ fontWeight: 500 }}>
          {spell.name}
        </Typography>
        {spell.description && !open ? (
          <Typography variant="bodySm" noWrap sx={{ color: 'ledger.muted' }}>
            {spell.description}
          </Typography>
        ) : null}
      </Box>

      <Tooltip title={`Resets on ${RESET_WORD[spell.resetOn]}`}>
        <Box
          role="img"
          aria-label={`${remaining} of ${spell.slotsTotal} slots remaining`}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}
        >
          {Array.from({ length: spell.slotsTotal }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: pips are positional
            <Diamond key={index} size={10} filled={index < remaining} />
          ))}
          <Typography variant="caption">{`${remaining}/${spell.slotsTotal}`}</Typography>
        </Box>
      </Tooltip>

      <Button
        size="small"
        disabled={remaining <= 0 || cast.isPending}
        onClick={() => cast.mutate(spell.id)}
      >
        Cast
      </Button>

      <Box data-row-actions>
        {onEdit ? (
          <Button variant="quiet" size="small" onClick={onEdit}>
            Edit
          </Button>
        ) : null}
      </Box>

      <AnimatePresence initial={false}>
        {open && spell.description ? (
          <motion.div
            key="description"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ gridColumn: '3 / -1', overflow: 'hidden' }}
          >
            <Typography variant="bodySm" sx={{ whiteSpace: 'pre-wrap', color: 'ledger.muted' }}>
              {spell.description}
            </Typography>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {failure ? (
        <Typography
          variant="caption"
          role="alert"
          sx={{ gridColumn: '3 / -1', color: 'error.main' }}
        >
          {errorMessage(failure)}
        </Typography>
      ) : null}
    </RuledRow>
  )
}
