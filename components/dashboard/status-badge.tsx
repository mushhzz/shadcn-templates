import { Badge } from "@/components/ui/badge"
import type { CustomerStatus, OrderStatus } from "@/lib/dashboard/types"

type Variant = "default" | "secondary" | "destructive" | "outline"

const variants: Record<OrderStatus | CustomerStatus, Variant> = {
  paid: "default",
  active: "default",
  pending: "secondary",
  trial: "secondary",
  refunded: "outline",
  churned: "outline",
  failed: "destructive",
}

export function StatusBadge({ status }: { status: OrderStatus | CustomerStatus }) {
  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  )
}
