"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type KanbanCard = {
  id: string
  columnId: string
  title: string
  subtitle?: string
  meta?: React.ReactNode
}

export type KanbanColumn = {
  id: string
  title: string
  /** Work-in-progress limit; the count turns red when exceeded. */
  limit?: number
}

export type KanbanBoardProps = {
  columns: KanbanColumn[]
  cards: KanbanCard[]
  onCardsChange: (cards: KanbanCard[]) => void
  renderCard?: (card: KanbanCard) => React.ReactNode
  onCardClick?: (card: KanbanCard) => void
  /** Shows an "Add" button at the bottom of each column. */
  onAddCard?: (columnId: string) => void
  /** Extra controls in a column header (menu, collapse…). */
  columnActions?: (column: KanbanColumn) => React.ReactNode
  emptyColumnLabel?: string
  className?: string
}

/**
 * Pure move: returns a new array with `cardId` placed in `toColumnId` at `toIndex`
 * (index within that column). Other columns keep their relative order.
 */
export function moveCard(cards: KanbanCard[], cardId: string, toColumnId: string, toIndex: number): KanbanCard[] {
  const card = cards.find((c) => c.id === cardId)
  if (!card) return cards
  const without = cards.filter((c) => c.id !== cardId)
  const target = without.filter((c) => c.columnId === toColumnId)
  const others = without.filter((c) => c.columnId !== toColumnId)
  const idx = Math.max(0, Math.min(toIndex, target.length))
  target.splice(idx, 0, { ...card, columnId: toColumnId })
  return [...others, ...target]
}

function DefaultCard({ card }: { card: KanbanCard }) {
  return (
    <>
      <div className="text-sm font-medium">{card.title}</div>
      {card.subtitle ? <div className="text-xs text-muted-foreground">{card.subtitle}</div> : null}
      {card.meta ? <div className="mt-2">{card.meta}</div> : null}
    </>
  )
}

function SortableCard({
  card,
  render,
  onClick,
}: {
  card: KanbanCard
  render: (card: KanbanCard) => React.ReactNode
  onClick?: (card: KanbanCard) => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", columnId: card.columnId },
  })
  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-dragging={isDragging || undefined}
      className={cn(
        "group/card relative py-0 transition-shadow hover:shadow-sm",
        onClick && "cursor-pointer",
        isDragging && "opacity-50 ring-2 ring-ring",
      )}
      onClick={() => onClick?.(card)}
    >
      <CardContent className="p-3 pr-8">{render(card)}</CardContent>
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Drag ${card.title}`}
        className="absolute right-1 top-2 cursor-grab touch-none rounded p-1 text-muted-foreground opacity-60 outline-none hover:bg-muted focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing group-hover/card:opacity-100"
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
    </Card>
  )
}

function Column({
  column,
  cards,
  render,
  onCardClick,
  onAddCard,
  actions,
  emptyLabel,
}: {
  column: KanbanColumn
  cards: KanbanCard[]
  render: (card: KanbanCard) => React.ReactNode
  onCardClick?: (card: KanbanCard) => void
  onAddCard?: (columnId: string) => void
  actions?: React.ReactNode
  emptyLabel: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column" } })
  const over = column.limit !== undefined && cards.length > column.limit
  return (
    <section
      data-testid={`kanban-column-${column.id}`}
      aria-label={column.title}
      className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-sm font-medium">{column.title}</span>
        <Badge variant={over ? "destructive" : "secondary"} aria-label={`${cards.length} cards${column.limit !== undefined ? ` of ${column.limit}` : ""}`}>
          {cards.length}
          {column.limit !== undefined ? `/${column.limit}` : ""}
        </Badge>
        <div className="ml-auto flex items-center gap-1">{actions}</div>
      </div>
      <SortableContext id={column.id} items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={cn("flex min-h-24 flex-1 flex-col gap-2 p-2 transition-colors", isOver && "bg-muted")}>
          {cards.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-md border border-dashed p-4 text-xs text-muted-foreground">{emptyLabel}</div>
          ) : (
            cards.map((card) => <SortableCard key={card.id} card={card} render={render} onClick={onCardClick} />)
          )}
        </div>
      </SortableContext>
      {onAddCard ? (
        <div className="p-2 pt-0">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => onAddCard(column.id)}>
            <Plus className="size-4" /> Add card
          </Button>
        </div>
      ) : null}
    </section>
  )
}

export function KanbanBoard({
  columns,
  cards,
  onCardsChange,
  renderCard,
  onCardClick,
  onAddCard,
  columnActions,
  emptyColumnLabel = "Drop cards here",
  className,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  // Stable id so dnd-kit's aria attributes match between server and client render.
  const dndId = React.useId()
  const render = renderCard ?? ((c: KanbanCard) => <DefaultCard card={c} />)
  // Mouse drags start after a small move; touch needs a short hold so the
  // board can still be scrolled with a swipe on phones and tablets.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const columnTitle = (id: string) => columns.find((c) => c.id === id)?.title ?? id
  const cardTitle = (id: string) => cards.find((c) => c.id === id)?.title ?? String(id)
  const findColumnId = (id: string) => (columns.some((c) => c.id === id) ? id : cards.find((c) => c.id === id)?.columnId)

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${cardTitle(String(active.id))}.`,
    onDragOver: ({ active, over }) => (over ? `${cardTitle(String(active.id))} is over ${columnTitle(findColumnId(String(over.id)) ?? "")}.` : undefined),
    onDragEnd: ({ active, over }) =>
      over ? `Dropped ${cardTitle(String(active.id))} in ${columnTitle(findColumnId(String(over.id)) ?? "")}.` : `Dropped ${cardTitle(String(active.id))}.`,
    onDragCancel: ({ active }) => `Cancelled moving ${cardTitle(String(active.id))}.`,
  }

  const placeOver = (activeCardId: string, overId: string) => {
    const toColumn = findColumnId(overId)
    if (!toColumn) return
    const targetCards = cards.filter((c) => c.columnId === toColumn && c.id !== activeCardId)
    const overIndex = targetCards.findIndex((c) => c.id === overId)
    onCardsChange(moveCard(cards, activeCardId, toColumn, overIndex === -1 ? targetCards.length : overIndex))
  }

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))
  const handleDragOver = (e: DragOverEvent) => {
    if (!e.over) return
    const activeCardId = String(e.active.id)
    const fromColumn = findColumnId(activeCardId)
    const toColumn = findColumnId(String(e.over.id))
    if (!fromColumn || !toColumn || fromColumn === toColumn) return
    placeOver(activeCardId, String(e.over.id))
  }
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    if (!e.over) return
    placeOver(String(e.active.id), String(e.over.id))
  }

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : undefined

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCorners}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div data-slot="kanban-board" className={cn("flex gap-4 overflow-x-auto pb-2", className)}>
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            cards={cards.filter((c) => c.columnId === col.id)}
            render={render}
            onCardClick={onCardClick}
            onAddCard={onAddCard}
            actions={columnActions?.(col)}
            emptyLabel={emptyColumnLabel}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? (
          <Card className="w-72 rotate-1 py-0 shadow-lg">
            <CardContent className="p-3 pr-8">{render(activeCard)}</CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export function KanbanBoardSkeleton({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <div data-slot="kanban-board-skeleton" className={cn("flex gap-4 overflow-x-auto pb-2", className)} aria-busy>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-muted/50 p-2">
          <div className="flex items-center justify-between px-1 py-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-6" />
          </div>
          {Array.from({ length: 2 + (i % 3) }).map((_, j) => (
            <Skeleton key={j} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  )
}
