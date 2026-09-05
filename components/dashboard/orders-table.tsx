"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
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
  DataTableSelectColumn,
  createDataTableColumnHelper,
} from "@/components/blocks/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatCurrency, formatDate, formatRelative } from "@/lib/dashboard/format"
import type { OrderRow, OrderStatus, Product } from "@/lib/dashboard/types"

const h = createDataTableColumnHelper<OrderRow>()

export function OrdersTable({ orders, products }: { orders: OrderRow[]; products: Product[] }) {
  const [status, setStatus] = React.useState<OrderStatus | "all">("all")
  const [selected, setSelected] = React.useState<OrderRow | null>(null)
  const productById = React.useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const filtered = status === "all" ? orders : orders.filter((o) => o.status === status)

  const columns = React.useMemo(
    () =>
      h.columns([
        DataTableSelectColumn<OrderRow>(),
        h.accessor("id", {
          header: "Order",
          cell: ({ row }) => (
            <button
              type="button"
              className="font-mono text-xs underline-offset-4 hover:underline"
              onClick={() => setSelected(row.original)}
            >
              {row.original.id}
            </button>
          ),
        }),
        h.accessor("customerName", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        }),
        h.accessor("status", {
          header: "Status",
          cell: ({ getValue }) => <StatusBadge status={getValue()} />,
        }),
        h.accessor("channel", {
          header: "Channel",
          cell: ({ getValue }) => (
            <Badge variant="outline" className="capitalize">
              {getValue()}
            </Badge>
          ),
        }),
        h.accessor("itemCount", {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Items" className="justify-end" />
          ),
          cell: ({ getValue }) => <div className="text-right tabular-nums">{getValue()}</div>,
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
          header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground">{formatDate(getValue())}</span>
          ),
        }),
      ]),
    [],
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(o) => o.id}
        emptyMessage="No orders with this status."
        toolbar={
          <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus | "all")}>
            <SelectTrigger className="h-8 w-36" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{selected.id}</SheetTitle>
                <SheetDescription suppressHydrationWarning>
                  {selected.customerName} · {formatRelative(selected.createdAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 px-4 text-sm">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <Badge variant="outline" className="capitalize">
                    {selected.channel}
                  </Badge>
                </div>
                <Separator />
                <div className="grid gap-2">
                  {selected.items.map((item, i) => {
                    const p = productById.get(item.productId)
                    return (
                      <div key={`${item.productId}-${i}`} className="flex items-center justify-between">
                        <span>
                          {p?.name ?? item.productId}{" "}
                          <span className="text-muted-foreground">× {item.quantity}</span>
                        </span>
                        <span className="tabular-nums">
                          {formatCurrency((p?.price ?? 0) * item.quantity)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <Separator />
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(selected.total)}</span>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}
