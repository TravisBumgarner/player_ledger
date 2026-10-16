import type { Spell } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import Diamond from '@/components/ledger/Diamond'
import StatBox from '@/components/ledger/StatBox'
import { useCastSpell, useUpdateSpell } from '@/hooks/mutations/useSpellMutations'
import { errorMessage } from '@/lib/errorMessages'
import PinButton from '@/sharedComponents/PinButton'

const RESET_WORD: Record<Spell['resetOn'], string> = { short: 'short rest', long: 'long rest' }

export type SpellCardProps = {
  spell: Spell
  onEdit?: () => void
}

export default function SpellCard({ spell, onEdit }: SpellCardProps) {
  const { character } = useActiveCharacter()
  const update = useUpdateSpell(character.id)
  const cast = useCastSpell(character.id)

  const remaining = spell.slotsTotal - spell.slotsUsed
  const failure = update.error ?? cast.error

  return (
    <Box
      component="article"
      className="ledger-row"
      sx={{
        display: 'grid',
        gridTemplateColumns: '64px minmax(0, 1fr)',
        gap: 5,
        py: 5,
        borderBottom: 1,
        borderColor: 'ledger.line',
      }}
    >
      <StatBox value={spell.level} label="Level" />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 3,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="title" component="h3" sx={{ overflowWrap: 'anywhere' }}>
              {spell.name}
            </Typography>
            <FormControlLabel
              label="Prepared"
              control={
                <Checkbox
                  size="small"
                  checked={spell.prepared}
                  onChange={(event) =>
                    update.mutate({ spellId: spell.id, input: { prepared: event.target.checked } })
                  }
                />
              }
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {onEdit ? (
              <Button variant="quiet" onClick={onEdit}>
                Edit
              </Button>
            ) : null}
            <PinButton
              pinned={spell.pinned}
              name={spell.name}
              onToggle={() =>
                update.mutate({ spellId: spell.id, input: { pinned: !spell.pinned } })
              }
            />
          </Box>
        </Box>

        {spell.description ? (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {spell.description}
          </Typography>
        ) : null}

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="capsXs">Slots</Typography>
            <Box
              role="img"
              aria-label={`${remaining} of ${spell.slotsTotal} slots remaining`}
              sx={{ display: 'flex', gap: 2 }}
            >
              {Array.from({ length: spell.slotsTotal }, (_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: pips are positional
                <Diamond key={index} size={10} filled={index < remaining} />
              ))}
            </Box>
            <Typography variant="bodySm" sx={{ color: 'ledger.muted' }}>
              {`${remaining} / ${spell.slotsTotal} · resets on ${RESET_WORD[spell.resetOn]}`}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            disabled={remaining <= 0 || cast.isPending}
            onClick={() => cast.mutate(spell.id)}
          >
            Cast · use 1 slot
          </Button>
        </Box>

        {failure ? (
          <Typography variant="caption" role="alert" sx={{ color: 'error.main' }}>
            {errorMessage(failure)}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}
