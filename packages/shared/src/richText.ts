import { z } from 'zod'

/** ProseMirror's JSON. Stored and sent as this, never as HTML: HTML is how markup gets injected. */
export type RichNode = {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: RichNode[]
}

export type RichDoc = { type: 'doc'; content?: RichNode[] }

const richNodeSchema: z.ZodType<RichNode> = z.lazy(() =>
  z.object({
    type: z.string().max(40),
    text: z.string().optional(),
    attrs: z.record(z.unknown()).optional(),
    marks: z
      .array(z.object({ type: z.string().max(40), attrs: z.record(z.unknown()).optional() }))
      .optional(),
    content: z.array(richNodeSchema).optional(),
  }),
)

const MAX_DOC_CHARS = 100_000

/** Readable text, counting a mention as its label: a note that is only "@Dorren" is not empty. */
export function richDocText(node: RichDoc | RichNode): string {
  const own =
    ('text' in node && node.text) ||
    (node.type === 'mention' && typeof node.attrs?.label === 'string' ? node.attrs.label : '')
  return own + (node.content ?? []).map(richDocText).join('')
}

export const richDocSchema = z
  .object({ type: z.literal('doc'), content: z.array(richNodeSchema).optional() })
  .refine((doc) => JSON.stringify(doc).length <= MAX_DOC_CHARS, 'too large')

/** A document someone actually wrote in; an editor left empty still emits a paragraph. */
export const nonEmptyRichDocSchema = richDocSchema.refine(
  (doc) => richDocText(doc).trim().length > 0,
  'empty',
)

const isEmptyParagraph = (node: RichNode) =>
  node.type === 'paragraph' && richDocText(node).length === 0

/** Drops trailing whitespace from the last text in a block, removing the text node if nothing is left. */
function trimBlockEnd(node: RichNode): RichNode {
  const content = [...(node.content ?? [])]
  const last = content[content.length - 1]
  if (!last) return node
  if (last.type === 'text' && last.text !== undefined) {
    const text = last.text.trimEnd()
    if (text) content[content.length - 1] = { ...last, text }
    else content.pop()
  } else if (last.content) {
    content[content.length - 1] = trimBlockEnd(last)
  }
  return { ...node, content }
}

/**
 * The editor keeps an empty paragraph after a list to type into, and a mention
 * inserts a space after itself; neither is part of the note.
 */
export function trimRichDoc(doc: RichDoc): RichDoc {
  const content = [...(doc.content ?? [])]
  while (content.length > 0 && isEmptyParagraph(content[content.length - 1])) content.pop()
  if (content.length > 0) content[content.length - 1] = trimBlockEnd(content[content.length - 1])
  return { ...doc, content }
}
