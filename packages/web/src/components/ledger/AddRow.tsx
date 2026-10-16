import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import Diamond from './Diamond'
import RuledRow from './RuledRow'

export type AddRowProps = {
  placeholder: string
  label: string
  /** Resolves once added; the field clears then. */
  onAdd: (text: string) => Promise<unknown> | undefined
  maxLength?: number
  disabled?: boolean
}

/** An empty ruled row: a hollow diamond and a borderless field. Enter adds. */
export default function AddRow({
  placeholder,
  label,
  onAdd,
  maxLength = 200,
  disabled,
}: AddRowProps) {
  const [text, setText] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    await onAdd(trimmed)
    setText('')
  }

  return (
    <form onSubmit={submit}>
      <RuledRow columns="28px minmax(0, 1fr) 36px">
        <Diamond />
        <InputBase
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          inputProps={{ 'aria-label': label, maxLength }}
        />
        <Typography variant="caption" aria-hidden="true" sx={{ textAlign: 'center' }}>
          ↵
        </Typography>
      </RuledRow>
    </form>
  )
}
