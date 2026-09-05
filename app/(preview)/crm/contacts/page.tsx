import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"
import { ContactsTable } from "@/components/crm/contacts-table"
import { getContacts } from "@/lib/crm/queries"

export default function ContactsPage() {
  return (
    <>
      <PageHeader title="Contacts" description="People you are selling to." actions={<Button>Add contact</Button>} />
      <ContactsTable contacts={getContacts()} />
    </>
  )
}
