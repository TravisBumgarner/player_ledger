import { useNavigate } from 'react-router-dom'
import ErrorScreen from '@/components/ErrorScreen'
import { ROUTES } from '@/lib/routes'

/** A dead address, said rather than swallowed: a redirect home reads as the link having worked. */
export default function NotFound() {
  const navigate = useNavigate()

  return (
    <ErrorScreen
      title="Nothing is here"
      detail="The link may be old, or mistyped."
      action={{ label: 'Go home', onAction: () => navigate(ROUTES.home) }}
    />
  )
}
