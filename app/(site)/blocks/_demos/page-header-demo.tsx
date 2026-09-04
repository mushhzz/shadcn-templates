import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"

export function PageHeaderDemo() {
  return (
    <PageHeader
      title="Customers"
      description="Manage your customer accounts."
      actions={<Button>Add customer</Button>}
    />
  )
}
