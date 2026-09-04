"use client"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableSelectColumn,
  createDataTableColumnHelper,
} from "@/components/blocks/data-table"

type Invoice = { id: string; customer: string; status: "paid" | "open" | "overdue"; amount: number }

const customers = ["Acme", "Globex", "Initech", "Umbrella", "Hooli"]
const statuses = ["paid", "open", "overdue"] as const

const invoices: Invoice[] = Array.from({ length: 23 }, (_, i) => ({
  id: `INV-${1000 + i}`,
  customer: customers[i % customers.length] ?? "Acme",
  status: statuses[i % statuses.length] ?? "paid",
  amount: 120 + i * 37,
}))

const h = createDataTableColumnHelper<Invoice>()
const columns = h.columns([
  DataTableSelectColumn<Invoice>(),
  h.accessor("id", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
  }),
  h.accessor("customer", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
  }),
  h.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => (
      <Badge variant={getValue() === "overdue" ? "destructive" : "secondary"}>{getValue()}</Badge>
    ),
  }),
  h.accessor("amount", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ getValue }) => `$${getValue().toLocaleString()}`,
  }),
])

export function DataTableDemo() {
  return (
    <DataTable
      columns={columns}
      data={invoices}
      getRowId={(r) => r.id}
      toolbar={<Input placeholder="Filter…" className="h-8 w-56" />}
    />
  )
}
