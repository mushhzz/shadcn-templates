"use client"

import * as React from "react"
import { KanbanBoard, type KanbanCard } from "@/components/blocks/kanban-board"

const columns = [
  { id: "lead", title: "Lead" },
  { id: "qualified", title: "Qualified" },
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
  return <KanbanBoard columns={columns} cards={cards} onCardsChange={setCards} />
}
