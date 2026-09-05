"use client"

import {
  DataTable,
  DataTableColumnHeader,
  createDataTableColumnHelper,
} from "@/components/blocks/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatCurrency, formatRelative } from "@/lib/dashboard/format"
import type { OrderRow } from "@/lib/dashboard/types"

const h = createDataTableColumnHelper<OrderRow>()
const columns = h.columns([
  h.accessor("id", {
    header: "Order",
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()}</span>,
  }),
  h.accessor("customerName", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
  }),
  h.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  }),
  h.accessor("total", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" className="justify-end" />
    ),
    cell: ({ getValue }) => (
      <div className="text-right tabular-nums">{formatCurrency(getValue())}</div>
    ),
  }),
  h.accessor("createdAt", {
    header: "When",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground" suppressHydrationWarning>
        {formatRelative(getValue())}
      </span>
    ),
  }),
])

export function RecentOrdersTable({ orders }: { orders: OrderRow[] }) {
  return <DataTable columns={columns} data={orders} pageSize={8} getRowId={(o) => o.id} />
}
