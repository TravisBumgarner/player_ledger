import { type CharacterProfile, MENTION_NODE } from '@awesomeness-mgmt/shared'
import Mention, { type MentionNodeAttrs } from '@tiptap/extension-mention'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { AnyExtension } from '@tiptap/react'
import { ReactRenderer } from '@tiptap/react'
import type { SuggestionOptions } from '@tiptap/suggestion'
import { useMemo, useRef } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useProfiles } from '@/hooks/queries/useProfiles'
import useCharacterPanelStore from '@/store/useCharacterPanelStore'
import { Z_INDEX } from '@/styles/styleConsts'
import MentionList, {
  isAbandoned,
  type MentionListHandle,
  type MentionListProps,
} from './MentionList'

const MAX_SUGGESTIONS = 8

function matchProfiles(profiles: CharacterProfile[], query: string): CharacterProfile[] {
  const needle = query.trim().toLowerCase()
  const prefix: CharacterProfile[] = []
  const substring: CharacterProfile[] = []
  for (const profile of profiles) {
    const name = profile.name.toLowerCase()
    if (name.startsWith(needle)) prefix.push(profile)
    else if (name.includes(needle)) substring.push(profile)
  }
  return [...prefix, ...substring].slice(0, MAX_SUGGESTIONS)
}

function renderSuggestion(): ReturnType<
  NonNullable<SuggestionOptions<CharacterProfile, MentionNodeAttrs>['render']>
> {
  let renderer: ReactRenderer<MentionListHandle, MentionListProps> | null = null
  let unmount: (() => void) | null = null
  let latest = { items: [] as CharacterProfile[], query: '' }

  return {
    onStart: (props) => {
      latest = props
      renderer = new ReactRenderer(MentionList, {
        editor: props.editor,
        props: { items: props.items, query: props.query, command: props.command },
      })
      renderer.element.style.zIndex = String(Z_INDEX.contextMenu)
      unmount = props.mount(renderer.element)
    },
    onUpdate: (props) => {
      latest = props
      renderer?.updateProps({ items: props.items, query: props.query, command: props.command })
    },
    onKeyDown: ({ event }) => {
      if (event.key === 'Escape' || isAbandoned(latest.items, latest.query)) return false
      return renderer?.ref?.onKeyDown(event) ?? false
    },
    onExit: () => {
      unmount?.()
      renderer?.destroy()
      unmount = null
      renderer = null
    },
  }
}

const mentionClickKey = new PluginKey('mentionClick')

/** Its state's `active` is true while the @ suggestion popup is open. */
export const mentionSuggestionKey = new PluginKey('mentionSuggestion')

/** Opens the character panel from a chip, editable or not: ProseMirror still takes clicks read-only. */
function mentionClickPlugin() {
  return new Plugin({
    key: mentionClickKey,
    props: {
      handleClickOn: (_view, _pos, node, _nodePos, event, direct) => {
        if (!direct || node.type.name !== MENTION_NODE || event.button !== 0) return false
        // A drag or shift-click that ends on a chip is selecting text, not following it.
        if (event.shiftKey || !(window.getSelection()?.isCollapsed ?? true)) return false
        const ref = node.attrs.id as string | null
        if (!ref) return false
        useCharacterPanelStore.getState().openProfile(ref)
        return true
      },
    },
  })
}

/**
 * The @mention extension wired to the active character's profiles, for any
 * RichTextEditor inside the ledger. Pass the result as `extensions`.
 */
export function useMentions(): AnyExtension[] {
  const { character } = useActiveCharacter()
  const { data } = useProfiles(character.id)

  // The editor builds its extensions once, so the list is read through a ref, not captured.
  const profilesRef = useRef<CharacterProfile[]>([])
  profilesRef.current = data ?? []

  return useMemo(
    () => [
      Mention.extend({
        addProseMirrorPlugins() {
          return [...(this.parent?.() ?? []), mentionClickPlugin()]
        },
      }).configure({
        renderText: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
        renderHTML: ({ node, options }) => [
          'span',
          { ...options.HTMLAttributes, 'data-mention-ref': node.attrs.id ?? '' },
          `@${node.attrs.label ?? node.attrs.id}`,
        ],
        suggestion: {
          char: '@',
          pluginKey: mentionSuggestionKey,
          allowSpaces: true,
          items: ({ query }) => matchProfiles(profilesRef.current, query),
          render: renderSuggestion,
        },
      }),
    ],
    [],
  )
}
