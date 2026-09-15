import type { CharacterProfile } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Typography from '@mui/material/Typography'
import type { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useProfiles } from '@/hooks/queries/useProfiles'
import ProfileImage from '@/sharedComponents/ProfileImage'
import { Z_INDEX } from '@/styles/styleConsts'
import { mentionSuggestionKey } from './useMentions'

const OPEN_DELAY_MS = 300
const CLOSE_DELAY_MS = 150
const CARD_WIDTH = 280
const PORTRAIT_SIZE = 64
const CHIP_SELECTOR = '[data-mention-ref]'

type Hovered = { anchorEl: HTMLElement; ref: string }

function meta(profile: CharacterProfile): string {
  if (profile.kind === 'npc') return 'NPC'
  if (profile.isSelf) return 'you'
  return profile.playedBy ? `played by ${profile.playedBy}` : 'Party member'
}

function chipOf(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>(CHIP_SELECTOR) : null
}

/** A preview of the character behind an @mention chip, on mouse hover only. */
export default function MentionHoverCard({ editor }: { editor: Editor }) {
  const { character } = useActiveCharacter()
  const { data: profiles } = useProfiles(character.id)
  const [hovered, setHovered] = useState<Hovered | null>(null)
  const openTimer = useRef<number>(undefined)
  const closeTimer = useRef<number>(undefined)

  const cancelOpen = () => window.clearTimeout(openTimer.current)
  const cancelClose = () => window.clearTimeout(closeTimer.current)
  const scheduleClose = () => {
    cancelOpen()
    cancelClose()
    closeTimer.current = window.setTimeout(() => setHovered(null), CLOSE_DELAY_MS)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: the timer helpers only touch refs and setState
  useEffect(() => {
    const dom = editor.view.dom
    const suggesting = () => mentionSuggestionKey.getState(editor.state)?.active === true

    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const chip = chipOf(event.target)
      if (!chip) return
      cancelClose()
      cancelOpen()
      openTimer.current = window.setTimeout(() => {
        if (!chip.isConnected || suggesting()) return
        setHovered({ anchorEl: chip, ref: chip.dataset.mentionRef ?? '' })
      }, OPEN_DELAY_MS)
    }
    const onOut = (event: PointerEvent) => {
      const chip = chipOf(event.target)
      if (chip && chipOf(event.relatedTarget) !== chip) scheduleClose()
    }
    const dismiss = () => {
      cancelOpen()
      cancelClose()
      setHovered(null)
    }
    // A chip re-rendered by ProseMirror leaves the popper anchored to a detached node.
    const onTransaction = ({ transaction }: { transaction: { docChanged: boolean } }) => {
      if (transaction.docChanged || suggesting()) dismiss()
    }

    dom.addEventListener('pointerover', onOver)
    dom.addEventListener('pointerout', onOut)
    dom.addEventListener('pointerdown', dismiss)
    editor.on('transaction', onTransaction)
    return () => {
      dom.removeEventListener('pointerover', onOver)
      dom.removeEventListener('pointerout', onOut)
      dom.removeEventListener('pointerdown', dismiss)
      editor.off('transaction', onTransaction)
      cancelOpen()
      cancelClose()
    }
  }, [editor])

  if (!hovered) return null

  const profile = profiles?.find((candidate) => candidate.ref === hovered.ref)
  const label = hovered.anchorEl.textContent?.replace(/^@/, '') ?? hovered.ref

  return (
    <Popper
      open
      anchorEl={hovered.anchorEl}
      placement="bottom-start"
      modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}
      sx={{ zIndex: Z_INDEX.contextMenu }}
    >
      <Paper
        variant="menu"
        onPointerEnter={cancelClose}
        onPointerLeave={scheduleClose}
        sx={{ width: 'max-content', maxWidth: CARD_WIDTH, p: '10px', display: 'flex', gap: '10px' }}
      >
        {profile ? (
          <>
            <ProfileImage characterId={character.id} profile={profile} size={PORTRAIT_SIZE} />
            <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <Typography variant="h6" noWrap>
                {profile.name}
              </Typography>
              <Typography variant="meta">{meta(profile)}</Typography>
              {profile.description && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: '3px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {profile.description}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <Typography variant="h6" noWrap>
              {label}
            </Typography>
            <Typography variant="meta">No longer in this ledger.</Typography>
          </Box>
        )}
      </Paper>
    </Popper>
  )
}
