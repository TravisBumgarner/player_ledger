import NotesCard from '@/components/journal/NotesCard'
import Page from '@/components/ledger/Page'
import GoalsCard from '@/components/overview/GoalsCard'

export default function CharacterDevelopment() {
  return (
    <Page>
      <GoalsCard />
      <NotesCard kind="development" title="Journal" />
    </Page>
  )
}
