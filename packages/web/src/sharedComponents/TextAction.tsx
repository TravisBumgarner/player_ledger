import Link, { type LinkProps } from '@mui/material/Link'

/** "Edit", "Remove", "+ note": an action that reads as a word in a row, not a button. */
export default function TextAction(props: Omit<LinkProps<'button'>, 'component'>) {
  return <Link component="button" type="button" variant="body2" {...props} />
}
