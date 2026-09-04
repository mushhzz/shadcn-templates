"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type KanbanCard = {
  id: string
  columnId: string
  title: string
  subtitle?: string
  meta?: React.ReactNode
}

export type KanbanColumn = { id: string; title: string }

export type KanbanBoardProps = {
  columns: KanbanColumn[]
  cards: KanbanCard[]
  onCardsChange: (cards: KanbanCard[]) => void
  renderCard?: (card: KanbanCard) => React.ReactNode
  onCardClick?: (card: KanbanCard) => void
  className?: string
}

/**
 * Pure move: returns a new array with `cardId` placed in `toColumnId` at `toIndex`
 * (index within that column). Other columns keep their relative order.
 */
export function moveCard(
  cards: KanbanCard[],
  cardId: string,
  toColumnId: string,
  toIndex: number,
): KanbanCard[] {
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", columnId: card.columnId },
  })
  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("cursor-grab py-0 active:cursor-grabbing", isDragging && "opacity-50")}
      onClick={() => onClick?.(card)}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">{render(card)}</CardContent>
    </Card>
  )
}

function Column({
  column,
  cards,
  render,
  onCardClick,
}: {
  column: KanbanColumn
  cards: KanbanCard[]
  render: (card: KanbanCard) => React.ReactNode
  onCardClick?: (card: KanbanCard) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column" } })
  return (
    <div
      data-testid={`kanban-column-${column.id}`}
      className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium">{column.title}</span>
        <Badge variant="secondary">{cards.length}</Badge>
      </div>
      <SortableContext
        id={column.id}
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn("flex min-h-24 flex-1 flex-col gap-2 p-2", isOver && "bg-muted")}
        >
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} render={render} onClick={onCardClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard({
  columns,
  cards,
  onCardsChange,
  renderCard,
  onCardClick,
  className,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const render = renderCard ?? ((c: KanbanCard) => <DefaultCard card={c} />)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const findColumnId = (id: string) => {
    if (columns.some((c) => c.id === id)) return id
    return cards.find((c) => c.id === id)?.columnId
  }

  const placeOver = (activeCardId: string, overId: string) => {
    const toColumn = findColumnId(overId)
    if (!toColumn) return
    const targetCards = cards.filter((c) => c.columnId === toColumn && c.id !== activeCardId)
    const overIndex = targetCards.findIndex((c) => c.id === overId)
    onCardsChange(
      moveCard(cards, activeCardId, toColumn, overIndex === -1 ? targetCards.length : overIndex),
    )
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
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div data-slot="kanban-board" className={cn("flex gap-4 overflow-x-auto pb-2", className)}>
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            cards={cards.filter((c) => c.columnId === col.id)}
            render={render}
            onCardClick={onCardClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? (
          <Card className="w-72 py-0 shadow-lg">
            <CardContent className="p-3">{render(activeCard)}</CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
