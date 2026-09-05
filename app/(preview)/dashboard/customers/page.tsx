import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"
import { CustomersTable } from "@/components/dashboard/customers-table"
import { getCustomers, getOrders } from "@/lib/dashboard/queries"

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone who has an account."
        actions={<Button>Add customer</Button>}
      />
      <CustomersTable customers={getCustomers()} orders={getOrders()} />
    </>
  )
}
