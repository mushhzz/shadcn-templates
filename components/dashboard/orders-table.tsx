"use client"

import * as React from "react"
import { Copy, Eye, RefreshCcw } from "lucide-react"
import { toast } from "sonner"
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
import type { OrderRow, Product } from "@/lib/dashboard/types"

const h = createDataTableColumnHelper<OrderRow>()

export function OrdersTable({ orders, products }: { orders: OrderRow[]; products: Product[] }) {
  const [selected, setSelected] = React.useState<OrderRow | null>(null)
  const productById = React.useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const columns = React.useMemo(
    () =>
      h.columns([
        DataTableSelectColumn<OrderRow>(),
        h.accessor("id", {
          header: "Order",
          cell: ({ row }) => (
            <button type="button" className="font-mono text-xs underline-offset-4 hover:underline" onClick={() => setSelected(row.original)}>
              {row.original.id}
            </button>
          ),
        }),
        h.accessor("customerName", { header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" /> }),
        h.accessor("status", {
          header: "Status",
          cell: ({ getValue }) => <StatusBadge status={getValue()} />,
          filterFn: "arrIncludesSome",
        }),
        h.accessor("channel", {
          header: "Channel",
          cell: ({ getValue }) => (
            <Badge variant="outline" className="capitalize">
              {getValue()}
            </Badge>
          ),
          filterFn: "arrIncludesSome",
        }),
        h.accessor("itemCount", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Items" className="justify-end" />,
          cell: ({ getValue }) => <div className="text-right tabular-nums">{getValue()}</div>,
        }),
        h.accessor("total", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Total" className="justify-end" />,
          cell: ({ getValue }) => <div className="text-right tabular-nums">{formatCurrency(getValue())}</div>,
        }),
        h.accessor("createdAt", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
          cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue())}</span>,
          sortFn: "datetime",
        }),
        DataTableActionsColumn<OrderRow>((o) => [
          { label: "View details", icon: Eye, onSelect: () => setSelected(o) },
          { label: "Copy order ID", icon: Copy, onSelect: () => void navigator.clipboard?.writeText(o.id).then(() => toast("Copied")) },
          { label: "Refund", icon: RefreshCcw, destructive: true, separator: true, onSelect: () => toast.error(`Refund started for ${o.id}`) },
        ]),
      ]),
    [],
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={orders}
        getRowId={(o) => o.id}
        enableSearch
        searchPlaceholder="Search orders…"
        facets={[
          {
            column: "status",
            title: "Status",
            options: [
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
              { value: "refunded", label: "Refunded" },
              { value: "failed", label: "Failed" },
            ],
          },
          {
            column: "channel",
            title: "Channel",
            options: [
              { value: "web", label: "Web" },
              { value: "mobile", label: "Mobile" },
              { value: "partner", label: "Partner" },
            ],
          },
        ]}
        exportFilename="orders.csv"
        bulkActions={(rows, clear) => (
          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={() => {
              toast(`Marked ${rows.length} orders as fulfilled`)
              clear()
            }}
          >
            Mark fulfilled
          </Button>
        )}
        emptyMessage="No orders match your filters."
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
                          {p?.name ?? item.productId} <span className="text-muted-foreground">× {item.quantity}</span>
                        </span>
                        <span className="tabular-nums">{formatCurrency((p?.price ?? 0) * item.quantity)}</span>
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
