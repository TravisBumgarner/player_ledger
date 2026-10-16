import NotesCard from '@/components/journal/NotesCard'
import Page from '@/components/ledger/Page'

export default function SessionNotes() {
  return (
    <Page>
      <NotesCard kind="session" />
    </Page>
  )
}
