import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { ToolCallCard, formatJson } from "@/components/blocks/tool-call-card"

describe("formatJson", () => {
  it("pretty prints objects and passes strings through", () => {
    expect(formatJson({ a: 1 })).toBe('{\n  "a": 1\n}')
    expect(formatJson("plain")).toBe("plain")
  })
})

describe("ToolCallCard", () => {
  it("shows name, status and duration, collapsed by default", () => {
    render(
      <ToolCallCard
        name="search_web"
        status="success"
        durationMs={1234}
        input={{ q: "x" }}
        output="ok"
      />,
    )
    expect(screen.getByText("search_web")).toBeInTheDocument()
    expect(screen.getByTestId("tool-call-status")).toHaveAttribute("data-status", "success")
    expect(screen.getByText("1.2s")).toBeInTheDocument()
    expect(screen.queryByText(/"q": "x"/)).toBeNull()
  })

  it("expands to show input and output", async () => {
    render(
      <ToolCallCard name="search_web" status="error" input={{ q: "x" }} output={{ error: "boom" }} />,
    )
    await userEvent.click(screen.getByRole("button", { name: /search_web/ }))
    expect(screen.getByText(/"q": "x"/)).toBeInTheDocument()
    expect(screen.getByText(/"error": "boom"/)).toBeInTheDocument()
  })
})
