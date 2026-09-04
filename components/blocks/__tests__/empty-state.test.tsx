import { render, screen } from "@testing-library/react"
import { Inbox } from "lucide-react"
import { describe, expect, it } from "vitest"
import { EmptyState } from "@/components/blocks/empty-state"

describe("EmptyState", () => {
  it("renders icon, title, description and action", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No messages"
        description="Start a conversation"
        action={<button>New</button>}
      />,
    )
    expect(screen.getByText("No messages")).toBeInTheDocument()
    expect(screen.getByText("Start a conversation")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument()
    expect(screen.getByTestId("empty-state-icon")).toBeInTheDocument()
  })

  it("renders without icon", () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.queryByTestId("empty-state-icon")).toBeNull()
  })
})
