import type { Spell } from '@awesomeness-mgmt/shared'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useCastSpell, useUpdateSpell } from '@/hooks/mutations/useSpellMutations'
import { errorMessage } from '@/lib/errorMessages'
import PinButton from '@/sharedComponents/PinButton'
import TextAction from '@/sharedComponents/TextAction'

const RESET_WORD: Record<Spell['resetOn'], string> = { short: 'short rest', long: 'long rest' }

function slotsLabel(spell: Spell): string {
  return `${spell.slotsTotal - spell.slotsUsed} / ${spell.slotsTotal} slots · resets on ${RESET_WORD[spell.resetOn]}`
}

export type SpellCardProps = {
  spell: Spell
  /** Present on the Spells page. Without it the card is the Overview's pinned shape. */
  onEdit?: () => void
}

export default function SpellCard({ spell, onEdit }: SpellCardProps) {
  const { character } = useActiveCharacter()
  const update = useUpdateSpell(character.id)
  const cast = useCastSpell(character.id)
  const full = onEdit !== undefined

  const remaining = spell.slotsTotal - spell.slotsUsed
  const badge = spell.school ? `Lvl ${spell.level} · ${spell.school}` : `Lvl ${spell.level}`
  const failure = update.error ?? cast.error

  const castButton = (
    <Button
      size="small"
      disabled={remaining <= 0 || cast.isPending}
      onClick={() => cast.mutate(spell.id)}
    >
      Cast (use 1 slot)
    </Button>
  )

  const pin = (
    <PinButton
      pinned={spell.pinned}
      name={spell.name}
      onToggle={() => update.mutate({ spellId: spell.id, input: { pinned: !spell.pinned } })}
    />
  )

  const description = spell.description ? (
    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
      {spell.description}
    </Typography>
  ) : null

  return (
    <Paper variant="card" component="article" sx={{ p: '14px 18px', display: 'grid', gap: '8px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          columnGap: '12px',
          rowGap: '4px',
        }}
      >
        <Typography variant="h4" component="h3" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          {spell.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {full ? (
            <>
              <Chip label={badge} data-casing="as-written" />
              <FormControlLabel
                sx={{ mr: 0 }}
                label="Prepared"
                control={
                  <Checkbox
                    size="small"
                    checked={spell.prepared}
                    onChange={(event) =>
                      update.mutate({
                        spellId: spell.id,
                        input: { prepared: event.target.checked },
                      })
                    }
                  />
                }
              />
              <TextAction onClick={onEdit}>Edit</TextAction>
            </>
          ) : null}
          {pin}
        </Box>
      </Box>

      {full ? description : null}

      {full ? <Divider sx={{ mt: '4px' }} /> : null}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px 12px',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {slotsLabel(spell)}
        </Typography>
        {castButton}
      </Box>

      {full ? null : description}

      {failure ? <Alert severity="error">{errorMessage(failure)}</Alert> : null}
    </Paper>
  )
}
