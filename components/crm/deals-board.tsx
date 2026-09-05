"use client"

import * as React from "react"
import Link from "next/link"
import { KanbanSquare, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DataTable, DataTableColumnHeader, createDataTableColumnHelper } from "@/components/blocks/data-table"
import { KanbanBoard, type KanbanCard } from "@/components/blocks/kanban-board"
import { StageBadge } from "@/components/crm/stage-badge"
import { formatCompactCurrency, formatCurrency, formatDate, formatRelative } from "@/lib/crm/format"
import { STAGES } from "@/lib/crm/queries"
import type { DealRow, DealStage } from "@/lib/crm/types"

const h = createDataTableColumnHelper<DealRow>()

export function DealsBoard({ deals: initial }: { deals: DealRow[] }) {
  const [deals, setDeals] = React.useState(initial)
  const [view, setView] = React.useState<"board" | "list">("board")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const selected = deals.find((d) => d.id === selectedId) ?? null

  const cards: KanbanCard[] = deals.map((d) => ({
    id: d.id,
    columnId: d.stage,
    title: d.title,
    subtitle: d.companyName,
    meta: (
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium tabular-nums">{formatCompactCurrency(d.value)}</span>
        <span className="text-muted-foreground">{d.owner.split(" ")[0]}</span>
      </div>
    ),
  }))

  const onCardsChange = (next: KanbanCard[]) => {
    const stageById = new Map(next.map((c) => [c.id, c.columnId as DealStage]))
    setDeals((list) => list.map((d) => ({ ...d, stage: stageById.get(d.id) ?? d.stage })))
  }

  const columns = React.useMemo(
    () =>
      h.columns([
        h.accessor("title", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Deal" />,
          cell: ({ row }) => (
            <button type="button" className="text-left font-medium hover:underline" onClick={() => setSelectedId(row.original.id)}>
              {row.original.title}
            </button>
          ),
        }),
        h.accessor("companyName", { header: "Company" }),
        h.accessor("stage", { header: "Stage", cell: ({ getValue }) => <StageBadge stage={getValue()} /> }),
        h.accessor("owner", { header: "Owner" }),
        h.accessor("value", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Value" className="justify-end" />,
          cell: ({ getValue }) => <div className="text-right tabular-nums">{formatCurrency(getValue())}</div>,
        }),
        h.accessor("closeDate", {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Close" />,
          cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue())}</span>,
        }),
      ]),
    [],
  )

  const columnsForBoard = STAGES.map((s) => ({ id: s.id, title: s.title }))

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          aria-label="View"
          value={view}
          onValueChange={(v) => {
            if (v) setView(v as "board" | "list")
          }}
        >
          <ToggleGroupItem value="board" aria-label="Board view">
            <KanbanSquare className="size-4" /> Board
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="size-4" /> List
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="text-sm text-muted-foreground">
          {deals.filter((d) => !["won", "lost"].includes(d.stage)).length} open ·{" "}
          {formatCompactCurrency(deals.filter((d) => !["won", "lost"].includes(d.stage)).reduce((s, d) => s + d.value, 0))} in pipeline
        </div>
      </div>

      {view === "board" ? (
        <KanbanBoard columns={columnsForBoard} cards={cards} onCardsChange={onCardsChange} onCardClick={(c) => setSelectedId(c.id)} />
      ) : (
        <DataTable columns={columns} data={deals} getRowId={(d) => d.id} pageSize={12} />
      )}

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.title}</SheetTitle>
                <SheetDescription>
                  <Link href={`/crm/companies/${selected.companyId}`} className="hover:underline">
                    {selected.companyName}
                  </Link>{" "}
                  · {selected.contactName}
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 px-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StageBadge stage={selected.stage} />
                  <Badge variant="outline">{selected.owner}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Value" value={formatCurrency(selected.value)} />
                  <Field label="Expected close" value={formatDate(selected.closeDate)} />
                  <Field label="Created" value={<span suppressHydrationWarning>{formatRelative(selected.createdAt)}</span>} />
                  <Field label="Contact" value={<Link href={`/crm/contacts/${selected.contactId}`} className="hover:underline">{selected.contactName}</Link>} />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <span className="text-xs text-muted-foreground">Move to stage</span>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map((s) => (
                      <Button
                        key={s.id}
                        size="sm"
                        variant={s.id === selected.stage ? "default" : "outline"}
                        onClick={() => setDeals((list) => list.map((d) => (d.id === selected.id ? { ...d, stage: s.id } : d)))}
                      >
                        {s.title}
                      </Button>
                    ))}
                  </div>
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
