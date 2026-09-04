import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { KanbanBoard, moveCard, type KanbanCard } from "@/components/blocks/kanban-board"

const columns = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "Doing" },
  { id: "done", title: "Done" },
]
const cards: KanbanCard[] = [
  { id: "a", columnId: "todo", title: "A" },
  { id: "b", columnId: "todo", title: "B" },
  { id: "c", columnId: "doing", title: "C" },
]

describe("moveCard", () => {
  it("moves a card to another column at an index", () => {
    const next = moveCard(cards, "a", "doing", 1)
    expect(next.filter((c) => c.columnId === "todo").map((c) => c.id)).toEqual(["b"])
    expect(next.filter((c) => c.columnId === "doing").map((c) => c.id)).toEqual(["c", "a"])
  })

  it("reorders within the same column", () => {
    const next = moveCard(cards, "b", "todo", 0)
    expect(next.filter((c) => c.columnId === "todo").map((c) => c.id)).toEqual(["b", "a"])
  })

  it("returns the same array when card is unknown", () => {
    expect(moveCard(cards, "zzz", "done", 0)).toBe(cards)
  })
})

describe("KanbanBoard", () => {
  it("renders columns with their cards and counts", () => {
    render(<KanbanBoard columns={columns} cards={cards} onCardsChange={() => {}} />)
    const todo = screen.getByTestId("kanban-column-todo")
    expect(within(todo).getByText("To do")).toBeInTheDocument()
    expect(within(todo).getByText("2")).toBeInTheDocument()
    expect(within(todo).getByText("A")).toBeInTheDocument()
    expect(within(screen.getByTestId("kanban-column-done")).getByText("0")).toBeInTheDocument()
  })

  it("calls onCardClick", () => {
    const onCardClick = vi.fn()
    render(
      <KanbanBoard columns={columns} cards={cards} onCardsChange={() => {}} onCardClick={onCardClick} />,
    )
    screen.getByText("C").click()
    expect(onCardClick).toHaveBeenCalledWith(cards[2])
  })
})
