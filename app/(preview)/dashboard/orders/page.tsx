import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/blocks/page-header"
import { OrdersTable } from "@/components/dashboard/orders-table"
import { getOrders, products } from "@/lib/dashboard/queries"

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        title="Orders"
        description="All orders from the last 30 days."
        actions={<Button variant="outline">Export CSV</Button>}
      />
      <OrdersTable orders={getOrders()} products={products} />
    </>
  )
}
