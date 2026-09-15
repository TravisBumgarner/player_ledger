import CodeIcon from '@mui/icons-material/Code'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import LinkIcon from '@mui/icons-material/Link'
import RedoIcon from '@mui/icons-material/Redo'
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS'
import UndoIcon from '@mui/icons-material/Undo'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import type { MouseEvent } from 'react'

const BLOCKS = [
  { value: 'paragraph', label: 'Body' },
  { value: 'h1', label: 'H1' },
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
] as const

type BlockValue = (typeof BLOCKS)[number]['value']

const MARKS = [
  { value: 'bold', label: 'Bold', Icon: FormatBoldIcon },
  { value: 'italic', label: 'Italic', Icon: FormatItalicIcon },
  { value: 'strike', label: 'Strikethrough', Icon: StrikethroughSIcon },
  { value: 'code', label: 'Inline code', Icon: CodeIcon },
] as const

const WRAPS = [
  { value: 'bulletList', label: 'Bulleted list', Icon: FormatListBulletedIcon },
  { value: 'orderedList', label: 'Numbered list', Icon: FormatListNumberedIcon },
  { value: 'blockquote', label: 'Quote', Icon: FormatQuoteIcon },
] as const

/** What a note written beside something else needs, and nothing more. */
const COMPACT_MARKS = MARKS.filter((mark) => mark.value === 'bold' || mark.value === 'italic')
const COMPACT_WRAPS = WRAPS.filter((wrap) => wrap.value !== 'blockquote')

/** Reads the editor rather than holding state, so a keyboard shortcut lights the button too. */
export default function Toolbar({
  editor,
  compact = false,
}: {
  editor: Editor
  /**
   * The set for an editor embedded in a panel that is mostly something else:
   * bold, italic, two kinds of list and a link. Headings, quotes, code and
   * history are the full editor's.
   */
  compact?: boolean
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      block: (BLOCKS.find((option) =>
        option.value === 'paragraph'
          ? current.isActive('paragraph')
          : current.isActive('heading', { level: Number(option.value.slice(1)) }),
      )?.value ?? null) as BlockValue | null,
      marks: MARKS.filter((mark) => current.isActive(mark.value)).map((mark) => mark.value),
      wraps: WRAPS.filter((wrap) => current.isActive(wrap.value)).map((wrap) => wrap.value),
      link: current.isActive('link') as boolean,
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  })

  /**
   * A prompt rather than a popover: the href is the whole of it, and clearing
   * the field is how a link comes off — which is one field and one rule instead
   * of a second control saying "remove".
   */
  const setLink = () => {
    const current = (editor.getAttributes('link').href as string | undefined) ?? ''
    const href = window.prompt('Link to', current)
    if (href === null) return

    const chain = editor.chain().focus().extendMarkRange('link')
    if (href.trim() === '') chain.unsetLink().run()
    else chain.setLink({ href: href.trim() }).run()
  }

  // Keeps focus in the document: a focused button would take the next Enter as a click.
  const keepFocus = (event: MouseEvent) => event.preventDefault()

  const marks = compact ? COMPACT_MARKS : MARKS
  const wraps = compact ? COMPACT_WRAPS : WRAPS

  const setBlock = (value: BlockValue | null) => {
    if (!value) return
    const chain = editor.chain().focus()
    if (value === 'paragraph') chain.setParagraph().run()
    else chain.setHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 }).run()
  }

  /**
   * Small in both editors. The default toggle button is sized for a page and
   * this toolbar is never on one — it sits in a sidebar or above a note, and at
   * that size four groups of them were the loudest thing on the panel.
   */
  const group = {
    '& .MuiToggleButton-root': { p: '2px 6px', minWidth: 0, border: 0 },
    border: '1px solid',
    borderColor: 'wireframe.borderFaint',
  }

  return (
    <Paper
      variant={compact ? 'outlined' : 'strip'}
      elevation={0}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        p: compact ? '4px 5px' : '5px 7px',
        alignItems: 'center',
        ...(compact
          ? { border: 0, borderBottom: '1px solid', borderColor: 'wireframe.borderFaint' }
          : {}),
      }}
    >
      {compact ? null : (
        <ToggleButtonGroup
          exclusive
          size="small"
          sx={group}
          value={state.block}
          aria-label="Block style"
        >
          {BLOCKS.map((option) => (
            <ToggleButton
              onMouseDown={keepFocus}
              key={option.value}
              value={option.value}
              aria-label={option.label}
              aria-pressed={state.block === option.value}
              onClick={() => setBlock(option.value)}
            >
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}

      <ToggleButtonGroup size="small" sx={group} value={state.marks} aria-label="Text style">
        {marks.map(({ value, label, Icon }) => (
          <ToggleButton
            onMouseDown={keepFocus}
            key={value}
            value={value}
            aria-label={label}
            aria-pressed={state.marks.includes(value)}
            onClick={() => editor.chain().focus().toggleMark(value).run()}
          >
            <Icon fontSize="small" />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <ToggleButtonGroup size="small" sx={group} value={state.wraps} aria-label="Blocks">
        {wraps.map(({ value, label, Icon }) => (
          <ToggleButton
            onMouseDown={keepFocus}
            key={value}
            value={value}
            aria-label={label}
            aria-pressed={state.wraps.includes(value)}
            onClick={() => {
              const chain = editor.chain().focus()
              if (value === 'bulletList') chain.toggleBulletList().run()
              else if (value === 'orderedList') chain.toggleOrderedList().run()
              else chain.toggleBlockquote().run()
            }}
          >
            <Icon fontSize="small" />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <ToggleButtonGroup
        size="small"
        sx={group}
        value={state.link ? ['link'] : []}
        aria-label="Link"
      >
        <ToggleButton
          value="link"
          onMouseDown={keepFocus}
          aria-label="Link"
          aria-pressed={state.link}
          onClick={setLink}
        >
          <LinkIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ flex: 1 }} />

      {compact ? null : (
        <>
          <Tooltip title="Undo">
            <span>
              <IconButton
                onMouseDown={keepFocus}
                size="small"
                aria-label="Undo"
                disabled={!state.canUndo}
                onClick={() => editor.chain().focus().undo().run()}
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo">
            <span>
              <IconButton
                onMouseDown={keepFocus}
                size="small"
                aria-label="Redo"
                disabled={!state.canRedo}
                onClick={() => editor.chain().focus().redo().run()}
              >
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </>
      )}
    </Paper>
  )
}
