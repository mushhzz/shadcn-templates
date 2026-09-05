import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"
import { DealsBoard } from "@/components/crm/deals-board"
import { getDeals } from "@/lib/crm/queries"

export default function DealsPage() {
  return (
    <>
      <PageHeader title="Deals" description="Drag deals between stages or switch to the list view." actions={<Button>New deal</Button>} />
      <DealsBoard deals={getDeals()} />
    </>
  )
}
