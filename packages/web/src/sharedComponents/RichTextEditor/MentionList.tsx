import type { CharacterProfile } from '@awesomeness-mgmt/shared'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import type { MentionNodeAttrs } from '@tiptap/extension-mention'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { MENU_WIDTH } from '@/styles/styleConsts'

export type MentionListProps = {
  items: CharacterProfile[]
  query: string
  command: (attrs: MentionNodeAttrs) => void
}

export type MentionListHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean
}

function meta(profile: CharacterProfile): string {
  if (profile.kind === 'npc') return 'NPC'
  return profile.playedBy ? `played by ${profile.playedBy}` : 'Party member'
}

/** A name with a space in it keeps the query open, so an unmatched one is just prose. */
export function isAbandoned(items: CharacterProfile[], query: string): boolean {
  return items.length === 0 && query.includes(' ')
}

const MentionList = forwardRef<MentionListHandle, MentionListProps>(function MentionList(
  { items, query, command },
  ref,
) {
  const [active, setActive] = useState(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new result list starts at the top
  useEffect(() => setActive(0), [items])

  const pick = (index: number) => {
    const profile = items[index]
    if (profile) command({ id: profile.ref, label: profile.name })
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (items.length === 0) return false
      if (event.key === 'ArrowDown') {
        setActive((index) => (index + 1) % items.length)
        return true
      }
      if (event.key === 'ArrowUp') {
        setActive((index) => (index - 1 + items.length) % items.length)
        return true
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        pick(active)
        return true
      }
      return false
    },
  }))

  if (isAbandoned(items, query)) return null

  return (
    <Paper variant="menu" sx={{ width: MENU_WIDTH, p: '5px' }}>
      <List dense disablePadding aria-label="Characters">
        {items.length === 0 ? (
          <ListItemText secondary="No characters match" sx={{ px: '10px', py: '6px', m: 0 }} />
        ) : (
          items.map((profile, index) => (
            <ListItemButton
              key={profile.ref}
              selected={index === active}
              // Keeps focus, and so the suggestion, in the editor until the click lands.
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => pick(index)}
              sx={{ px: '10px', py: '5px' }}
            >
              <ListItemText primary={profile.name} secondary={meta(profile)} sx={{ m: 0 }} />
            </ListItemButton>
          ))
        )}
      </List>
    </Paper>
  )
})

export default MentionList
