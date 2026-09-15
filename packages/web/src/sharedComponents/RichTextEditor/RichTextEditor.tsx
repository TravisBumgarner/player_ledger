import { MENTION_NODE, type RichDoc } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import type { Theme } from '@mui/material/styles'
import { Placeholder } from '@tiptap/extensions'
import type { AnyExtension, Content } from '@tiptap/react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import MentionHoverCard from './MentionHoverCard'
import Toolbar from './Toolbar'

export type RichTextEditorProps = {
  value: RichDoc | null
  onChange?: (value: RichDoc, isEmpty: boolean) => void
  /** Read-only is the same editor with this false — one renderer, not two. */
  editable?: boolean
  placeholder?: string
  /** Bold, italic, lists and a link only; for an editor that is not the point of its panel. */
  compact?: boolean
  /** For callers that need more than the house set, such as `useMentions()`. Appended. */
  extensions?: AnyExtension[]
  'aria-label'?: string
}

// ProseMirror builds this DOM, so there is no MUI slot to hang a `components.*` default on.
const contentStyles = (theme: Theme) => {
  const wf = theme.palette.wireframe
  return {
    '& .ProseMirror': {
      outline: 'none',
      ...theme.typography.body1,
      lineHeight: 1.65,
      color: wf.ink,
      '&[contenteditable="true"]': { minHeight: 120 },
      '& h1': { ...theme.typography.h3, margin: 0 },
      '& h2': { ...theme.typography.h4, margin: 0 },
      '& h3': { ...theme.typography.h5, margin: 0 },
      '& p': { margin: 0 },
      // Sibling selectors, so the first block never needs a margin taken back off.
      '& > * + *': { marginTop: '10px' },
      '& > * + h1': { marginTop: '16px' },
      '& > * + h2': { marginTop: '14px' },
      '& > * + h3': { marginTop: '12px' },
      // Enough to clear the marker and no more. The browser indents the list
      // and then the item again, which is where the doubled gutter came from.
      '& ul, & ol': { margin: 0, paddingLeft: '1.25em' },
      '& li': { margin: 0, paddingLeft: 2 },
      '& li > p': { margin: 0 },
      '& li > ul, & li > ol': { paddingLeft: '1.1em' },
      '& blockquote': {
        margin: 0,
        paddingLeft: '10px',
        borderLeft: `1.5px solid ${wf.borderStrong}`,
        color: wf.textBody,
      },
      '& code': {
        backgroundColor: wf.surfaceSunken,
        border: `1px solid ${wf.borderFaint}`,
        padding: '0 3px',
      },
      '& pre': {
        backgroundColor: wf.surfaceSunken,
        border: `1px solid ${wf.borderLight}`,
        padding: '8px 10px',
        overflowX: 'auto',
        '& code': { border: 'none', backgroundColor: 'transparent', padding: 0 },
      },
      '& a': { color: wf.ink, textDecorationColor: wf.border },
      // A reference in the prose rather than a button sitting on it.
      '& [data-mention-ref]': {
        color: wf.ink,
        fontWeight: 600,
        textDecoration: 'underline',
        textDecorationThickness: '1px',
        textDecorationColor: wf.border,
        textUnderlineOffset: '3px',
        cursor: 'pointer',
        '&:hover': { backgroundColor: wf.surfaceControl, textDecorationColor: wf.ink },
      },
      '& hr': { border: 'none', borderTop: `1px solid ${wf.borderLight}` },
      '& p.is-editor-empty:first-of-type::before': {
        content: 'attr(data-placeholder)',
        color: wf.textGhost,
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
  compact = false,
  extensions,
  'aria-label': ariaLabel = 'Document',
}: RichTextEditorProps) {
  const [focused, setFocused] = useState(false)

  const editor = useEditor({
    editable,
    content: (value ?? undefined) as Content,
    extensions: [
      // Link's default URI check is what keeps `javascript:` hrefs out of stored documents.
      StarterKit.configure({ link: { openOnClick: !editable, autolink: true } }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
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

  return (
    <Paper variant="panel" sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Toolbar editor={editor} compact={compact} />
      <Box sx={[{ p: '10px 12px' }, contentStyles]}>
        <EditorContent editor={editor} />
        {hoverCard}
      </Box>
    </Paper>
  )
}
