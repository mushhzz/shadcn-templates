import { PageHeader } from "@/components/blocks/page-header"
import { ContactsGrid } from "@/components/chat/contacts-grid"
import { getContacts } from "@/lib/chat/queries"

export default function ChatContactsPage() {
  return (
    <>
      <PageHeader title="Contacts" description="Everyone in your workspace." />
      <ContactsGrid contacts={getContacts()} />
    </>
  )
}
