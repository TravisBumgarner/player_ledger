import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import type { Theme } from '@mui/material/styles'
import { MENTION_NODE, type RichDoc } from '@player-ledger/shared'
import { Placeholder } from '@tiptap/extensions'
import { type AnyExtension, type Content, EditorContent, Extension, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import MentionHoverCard from './MentionHoverCard'
import Toolbar, { type ToolbarVariant } from './Toolbar'

export type RichTextEditorProps = {
  value: RichDoc | null
  onChange?: (value: RichDoc, isEmpty: boolean) => void
  /** Read-only is the same editor with this false — one renderer, not two. */
  editable?: boolean
  placeholder?: string
  /**
   * `full` is the framed editor with every control. `minimal` and `none` draw no frame of
   * their own — whatever holds them is the frame — and lean on markdown input rules.
   */
  toolbar?: 'none' | ToolbarVariant
  /** Trailing toolbar controls, such as Done or a hint. */
  toolbarEnd?: ReactNode
  /** The minimal toolbar sits under the text, on a rule. */
  toolbarBelow?: boolean
  autoFocus?: boolean
  /** Escape that nothing in the editor, such as an open mention list, claimed first. */
  onEscape?: () => void
  /** For callers that need more than the house set, such as `useMentions()`. Appended. */
  extensions?: AnyExtension[]
  'aria-label'?: string
}

// ProseMirror builds this DOM, so there is no MUI slot to hang a `components.*` default on.
// Lengths are px strings: inside sx a bare number for margin or padding is theme spacing (×4).
const contentStyles = (theme: Theme) => {
  const { text, muted, line, line2, panel, mention, accent } = theme.palette.ledger
  return {
    '& .ProseMirror': {
      outline: 'none',
      ...theme.typography.body1,
      lineHeight: 1.65,
      color: text,
      '&[contenteditable="true"]': { minHeight: 120 },
      '[data-frameless] &[contenteditable="true"]': { minHeight: '1.65em' },
      '& h1': { ...theme.typography.h2, margin: 0 },
      '& h2': { ...theme.typography.h3, margin: 0 },
      '& h3': { ...theme.typography.h4, margin: 0 },
      '& p': { margin: 0 },
      '& > * + *': { marginTop: '6px' },
      '& > * + h1, & > * + h2, & > * + h3': { marginTop: '12px' },
      '& ul, & ol': { margin: 0, paddingLeft: '1.25em' },
      '& li > p': { margin: 0 },
      '& blockquote': {
        margin: 0,
        paddingLeft: '12px',
        borderLeft: `2px solid ${accent}`,
        color: muted,
        fontStyle: 'italic',
      },
      '& code': {
        backgroundColor: panel,
        border: `1px solid ${line}`,
        borderRadius: 3,
        padding: '0 4px',
      },
      '& pre': {
        backgroundColor: panel,
        border: `1px solid ${line}`,
        borderRadius: 4,
        padding: '8px 12px',
        overflowX: 'auto',
        '& code': { border: 'none', backgroundColor: 'transparent', padding: 0 },
      },
      '& a': { color: accent, textDecorationColor: line2 },
      '& [data-mention-ref]': {
        color: mention,
        fontWeight: 500,
        cursor: 'pointer',
        '&:hover': { textDecoration: 'underline' },
      },
      '& hr': { border: 'none', borderTop: `1px solid ${line}` },
      '& p.is-editor-empty:first-of-type::before': {
        content: 'attr(data-placeholder)',
        color: muted,
        opacity: 0.85,
        float: 'left',
        height: 0,
        pointerEvents: 'none',
      },
    },
  }
}

/** ProseMirror JSON in and out, never HTML: stored HTML is how markup gets injected. */
export default function RichTextEditor({
  value,
  onChange,
  editable = true,
  placeholder,
  toolbar = 'minimal',
  toolbarEnd,
  toolbarBelow = false,
  autoFocus = false,
  onEscape,
  extensions,
  'aria-label': ariaLabel = 'Document',
}: RichTextEditorProps) {
  const [focused, setFocused] = useState(false)
  const onEscapeRef = useRef(onEscape)
  onEscapeRef.current = onEscape

  const editor = useEditor({
    editable,
    autofocus: autoFocus ? 'end' : false,
    content: (value ?? undefined) as Content,
    extensions: [
      // Link's default URI check is what keeps `javascript:` hrefs out of stored documents.
      StarterKit.configure({ link: { openOnClick: !editable, autolink: true } }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
      // Lowest priority, so the mention list's own Escape runs first.
      Extension.create({
        name: 'escape',
        priority: 0,
        addKeyboardShortcuts: () => ({
          Escape: () => {
            if (!onEscapeRef.current) return false
            onEscapeRef.current()
            return true
          },
        }),
      }),
      ...(extensions ?? []),
    ],
    editorProps: {
      attributes: editable
        ? { role: 'textbox', 'aria-label': ariaLabel, 'aria-multiline': 'true' }
        : { 'aria-label': ariaLabel },
    },
    onUpdate: ({ editor: current }) => onChange?.(current.getJSON() as RichDoc, current.isEmpty),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  })

  useEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  // A focused editor is the authority: a controlled caller echoing `onChange` arrives
  // one keystroke behind and would reset the text and throw the cursor to the end.
  useEffect(() => {
    if (!editor || !value || focused) return
    if (JSON.stringify(editor.getJSON()) === JSON.stringify(value)) return
    editor.commands.setContent(value as Content, { emitUpdate: false })
  }, [editor, value, focused])

  if (!editor) return null

  // Only `useMentions()` supplies this extension, and it already requires the ledger's context.
  const hoverCard = extensions?.some((extension) => extension.name === MENTION_NODE) ? (
    <MentionHoverCard editor={editor} />
  ) : null

  // Read-only is prose in whatever holds it; a frame would be a box inside that box.
  if (!editable) {
    return (
      <Box sx={contentStyles}>
        <EditorContent editor={editor} />
        {hoverCard}
      </Box>
    )
  }

  if (toolbar !== 'full') {
    const bar =
      toolbar === 'minimal' ? <Toolbar editor={editor} variant="minimal" end={toolbarEnd} /> : null
    return (
      <Box data-frameless sx={{ display: 'grid', gap: 2, minWidth: 0 }}>
        {toolbarBelow ? null : bar}
        <Box sx={contentStyles}>
          <EditorContent editor={editor} />
          {hoverCard}
        </Box>
        {toolbarBelow && bar ? (
          <Box sx={{ borderTop: 1, borderColor: 'ledger.line', pt: 2 }}>{bar}</Box>
        ) : null}
      </Box>
    )
  }

  return (
    <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Toolbar editor={editor} variant="full" end={toolbarEnd} />
      <Box sx={[{ px: 3, py: 2 }, contentStyles]}>
        <EditorContent editor={editor} />
        {hoverCard}
      </Box>
    </Paper>
  )
}
