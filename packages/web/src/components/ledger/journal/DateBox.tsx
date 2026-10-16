import { noteDate } from '@/lib/noteDate'
import StatBox from '../StatBox'

/** A note's label as a day over a month; a label that is not a date shows as written. */
export default function DateBox({ label, accent = false }: { label: string; accent?: boolean }) {
  const date = noteDate(label)
  return date ? (
    <StatBox value={date.day} label={date.month} accent={accent} />
  ) : /^\d{1,3}$/.test(label.trim()) ? (
    <StatBox value={label.trim()} label="" accent={accent} />
  ) : (
    <StatBox value="·" label={label.slice(0, 8)} accent={accent} />
  )
}
