"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { KanbanBoard, type KanbanCard } from "@/components/blocks/kanban-board"

const columns = [
  { id: "lead", title: "Lead" },
  { id: "qualified", title: "Qualified", limit: 2 },
  { id: "proposal", title: "Proposal" },
  { id: "won", title: "Won" },
]
const initial: KanbanCard[] = [
  { id: "1", columnId: "lead", title: "Acme renewal", subtitle: "$12,000" },
  { id: "2", columnId: "lead", title: "Globex pilot", subtitle: "$4,500" },
  { id: "3", columnId: "qualified", title: "Initech expansion", subtitle: "$28,000" },
  { id: "4", columnId: "proposal", title: "Hooli platform", subtitle: "$90,000" },
]

export function KanbanBoardDemo() {
  const [cards, setCards] = React.useState(initial)
  const seq = React.useRef(initial.length)
  return (
    <KanbanBoard
      columns={columns}
      cards={cards}
      onCardsChange={setCards}
      onCardClick={(c) => toast(c.title)}
      onAddCard={(columnId) => setCards((list) => [...list, { id: String(++seq.current), columnId, title: `New deal ${seq.current}`, subtitle: "$0" }])}
      columnActions={(col) => (
        <Button variant="ghost" size="icon" className="size-6" aria-label={`${col.title} column menu`} onClick={() => toast(`${col.title} menu`)}>
          <MoreHorizontal className="size-4" />
        </Button>
      )}
    />
  )
}
