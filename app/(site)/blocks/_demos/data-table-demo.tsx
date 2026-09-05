"use client"

import { Archive, Copy, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DataTable,
  DataTableActionsColumn,
  DataTableColumnHeader,
  DataTableSelectColumn,
  createDataTableColumnHelper,
} from "@/components/blocks/data-table"

type Invoice = { id: string; customer: string; status: "paid" | "open" | "overdue"; amount: number; issued: Date }

const customers = ["Acme", "Globex", "Initech", "Umbrella", "Hooli"]
const statuses = ["paid", "open", "overdue"] as const

const invoices: Invoice[] = Array.from({ length: 23 }, (_, i) => ({
  id: `INV-${1000 + i}`,
  customer: customers[i % customers.length] ?? "Acme",
  status: statuses[i % statuses.length] ?? "paid",
  amount: 120 + i * 37,
  issued: new Date(Date.UTC(2026, 7, 1 + i)),
}))

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

const h = createDataTableColumnHelper<Invoice>()
const columns = h.columns([
  DataTableSelectColumn<Invoice>(),
  h.accessor("id", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()}</span>,
  }),
  h.accessor("customer", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    filterFn: "arrIncludesSome",
  }),
  h.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => (
      <Badge variant={getValue() === "overdue" ? "destructive" : getValue() === "paid" ? "default" : "secondary"} className="capitalize">
        {getValue()}
      </Badge>
    ),
    filterFn: "arrIncludesSome",
  }),
  h.accessor("amount", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" className="justify-end" />,
    cell: ({ getValue }) => <div className="text-right tabular-nums">${getValue().toLocaleString("en-US")}</div>,
  }),
  h.accessor("issued", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Issued" />,
    cell: ({ getValue }) => <span className="text-muted-foreground">{dateFmt.format(getValue())}</span>,
    sortFn: "datetime",
  }),
  DataTableActionsColumn<Invoice>((inv) => [
    { label: "View", icon: Eye, onSelect: () => toast(`Opening ${inv.id}`) },
    { label: "Copy ID", icon: Copy, onSelect: () => toast(`Copied ${inv.id}`) },
    { label: "Archive", icon: Archive, onSelect: () => toast(`${inv.id} archived`) },
    { label: "Delete", icon: Trash2, destructive: true, separator: true, onSelect: () => toast.error(`${inv.id} deleted`) },
  ]),
])

export function DataTableDemo() {
  return (
    <DataTable
      columns={columns}
      data={invoices}
      getRowId={(r) => r.id}
      enableSearch
      searchPlaceholder="Search invoices…"
      facets={[
        {
          column: "status",
          title: "Status",
          options: [
            { value: "paid", label: "Paid" },
            { value: "open", label: "Open" },
            { value: "overdue", label: "Overdue" },
          ],
        },
        { column: "customer", title: "Customer", options: customers.map((c) => ({ value: c, label: c })) },
      ]}
      exportFilename="invoices.csv"
      bulkActions={(rows, clear) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7"
          onClick={() => {
            toast(`Sent ${rows.length} reminders`)
            clear()
          }}
        >
          Send reminder
        </Button>
      )}
    />
  )
}
