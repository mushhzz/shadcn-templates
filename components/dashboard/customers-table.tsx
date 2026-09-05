"use client"

import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DataTable,
  DataTableColumnHeader,
  createDataTableColumnHelper,
} from "@/components/blocks/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatCurrency, formatDate, formatRelative } from "@/lib/dashboard/format"
import type { CustomerRow, CustomerStatus, OrderRow } from "@/lib/dashboard/types"

const h = createDataTableColumnHelper<CustomerRow>()

export function CustomersTable({
  customers,
  orders,
}: {
  customers: CustomerRow[]
  orders: OrderRow[]
}) {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<CustomerStatus | "all">("all")
  const [selected, setSelected] = React.useState<CustomerRow | null>(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return customers.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (q === "" || [c.name, c.email, c.company].some((v) => v.toLowerCase().includes(q))),
    )
  }, [customers, query, status])

  const columns = React.useMemo(
    () =>
      h.columns([
        h.accessor("name", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
          cell: ({ row }) => (
            <button
              type="button"
              className="flex items-center gap-3 text-left"
              onClick={() => setSelected(row.original)}
            >
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{row.original.initials}</AvatarFallback>
              </Avatar>
              <div className="grid">
                <span className="font-medium">{row.original.name}</span>
                <span className="text-xs text-muted-foreground">{row.original.email}</span>
              </div>
            </button>
          ),
        }),
        h.accessor("company", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
        }),
        h.accessor("status", {
          header: "Status",
          cell: ({ getValue }) => <StatusBadge status={getValue()} />,
        }),
        h.accessor("plan", {
          header: "Plan",
          cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
        }),
        h.accessor("orderCount", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Orders" className="justify-end" />
          ),
          cell: ({ getValue }) => <div className="text-right tabular-nums">{getValue()}</div>,
        }),
        h.accessor("lifetimeValue", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Lifetime value" className="justify-end" />
          ),
          cell: ({ getValue }) => (
            <div className="text-right tabular-nums">{formatCurrency(getValue())}</div>
          ),
        }),
        h.accessor("createdAt", {
          header: "Joined",
          cell: ({ getValue }) => (
            <span className="text-muted-foreground">{formatDate(getValue())}</span>
          ),
        }),
      ]),
    [],
  )

  const customerOrders = selected ? orders.filter((o) => o.customerId === selected.id) : []

  return (
    <>
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(c) => c.id}
        emptyMessage="No customers match your filters."
        toolbar={
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search customers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-64"
            />
            <Select value={status} onValueChange={(v) => setStatus(v as CustomerStatus | "all")}>
              <SelectTrigger className="h-8 w-36" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <Avatar className="size-10">
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
                      <div
                        key={o.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
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
