"use client"

import * as React from "react"
import { Archive, Mail, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { personAvatar } from "@/lib/kit/assets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  DataTable,
  DataTableActionsColumn,
  DataTableColumnHeader,
  DataTableSelectColumn,
  createDataTableColumnHelper,
} from "@/components/blocks/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatCurrency, formatDate, formatRelative } from "@/lib/dashboard/format"
import type { CustomerRow, OrderRow } from "@/lib/dashboard/types"

const h = createDataTableColumnHelper<CustomerRow>()

export function CustomersTable({ customers, orders }: { customers: CustomerRow[]; orders: OrderRow[] }) {
  const [selected, setSelected] = React.useState<CustomerRow | null>(null)

  const columns = React.useMemo(
    () =>
      h.columns([
        DataTableSelectColumn<CustomerRow>(),
        h.accessor("name", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
          cell: ({ row }) => (
            <button type="button" className="flex items-center gap-3 text-left" onClick={() => setSelected(row.original)}>
              <Avatar className="size-8">
                <AvatarImage src={personAvatar(row.original.name)} alt="" />
                <AvatarFallback className="text-xs">{row.original.initials}</AvatarFallback>
              </Avatar>
              <div className="grid">
                <span className="font-medium">{row.original.name}</span>
                <span className="text-xs text-muted-foreground">{row.original.email}</span>
              </div>
            </button>
          ),
        }),
        h.accessor("company", { header: ({ column }) => <DataTableColumnHeader column={column} title="Company" /> }),
        h.accessor("status", {
          header: "Status",
          cell: ({ getValue }) => <StatusBadge status={getValue()} />,
          filterFn: "arrIncludesSome",
        }),
        h.accessor("plan", {
          header: "Plan",
          cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
          filterFn: "arrIncludesSome",
        }),
        h.accessor("orderCount", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" className="justify-end" />,
          cell: ({ getValue }) => <div className="text-right tabular-nums">{getValue()}</div>,
        }),
        h.accessor("lifetimeValue", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Lifetime value" className="justify-end" />,
          cell: ({ getValue }) => <div className="text-right tabular-nums">{formatCurrency(getValue())}</div>,
        }),
        h.accessor("createdAt", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
          cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue())}</span>,
          sortFn: "datetime",
        }),
        DataTableActionsColumn<CustomerRow>((c) => [
          { label: "View", icon: Pencil, onSelect: () => setSelected(c) },
          { label: "Email", icon: Mail, onSelect: () => toast(`Email drafted to ${c.email}`) },
          { label: "Archive", icon: Archive, onSelect: () => toast(`${c.name} archived`) },
          { label: "Delete", icon: Trash2, destructive: true, separator: true, onSelect: () => toast.error(`${c.name} deleted`) },
        ]),
      ]),
    [],
  )

  const customerOrders = selected ? orders.filter((o) => o.customerId === selected.id) : []

  return (
    <>
      <DataTable
        columns={columns}
        data={customers}
        getRowId={(c) => c.id}
        enableSearch
        searchPlaceholder="Search customers…"
        facets={[
          {
            column: "status",
            title: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "trial", label: "Trial" },
              { value: "churned", label: "Churned" },
            ],
          },
          {
            column: "plan",
            title: "Plan",
            options: [
              { value: "Free", label: "Free" },
              { value: "Pro", label: "Pro" },
              { value: "Team", label: "Team" },
            ],
          },
        ]}
        exportFilename="customers.csv"
        bulkActions={(rows, clear) => (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={() => {
                toast(`Emailed ${rows.length} customers`)
                clear()
              }}
            >
              <Mail className="size-3.5" /> Email
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={() => {
                toast(`Archived ${rows.length} customers`)
                clear()
              }}
            >
              <Archive className="size-3.5" /> Archive
            </Button>
          </>
        )}
        emptyMessage="No customers match your filters."
      />
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={personAvatar(selected.name)} alt="" />
                    <AvatarFallback>{selected.initials}</AvatarFallback>
                  </Avatar>
                  {selected.name}
                </SheetTitle>
                <SheetDescription>{selected.email}</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 px-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Company" value={selected.company} />
                  <Field label="Plan" value={selected.plan} />
                  <Field label="Status" value={<StatusBadge status={selected.status} />} />
                  <Field label="Lifetime value" value={formatCurrency(selected.lifetimeValue)} />
                  <Field label="Joined" value={formatDate(selected.createdAt)} />
                  <Field label="Orders" value={String(selected.orderCount)} />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <div className="font-medium">Recent orders</div>
                  {customerOrders.length === 0 ? (
                    <p className="text-muted-foreground">No orders yet.</p>
                  ) : (
                    customerOrders.slice(0, 6).map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <div className="grid">
                          <span className="font-mono text-xs">{o.id}</span>
                          <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                            {formatRelative(o.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={o.status} />
                          <span className="tabular-nums">{formatCurrency(o.total)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
