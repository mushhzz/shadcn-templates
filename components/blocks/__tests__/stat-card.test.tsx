import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StatCard, formatDelta } from "@/components/blocks/stat-card"

describe("formatDelta", () => {
  it("formats with sign and one decimal", () => {
    expect(formatDelta(12.49)).toBe("+12.5%")
    expect(formatDelta(-3)).toBe("-3.0%")
    expect(formatDelta(0)).toBe("0.0%")
  })
})

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Revenue" value="$12,340" />)
    expect(screen.getByText("Revenue")).toBeInTheDocument()
    expect(screen.getByText("$12,340")).toBeInTheDocument()
    expect(screen.queryByTestId("stat-card-delta")).toBeNull()
  })

  it("marks positive and negative deltas", () => {
    const { rerender } = render(
      <StatCard label="A" value="1" delta={4.2} deltaLabel="vs last month" />,
    )
    expect(screen.getByTestId("stat-card-delta")).toHaveAttribute("data-trend", "up")
    expect(screen.getByText("vs last month")).toBeInTheDocument()
    rerender(<StatCard label="A" value="1" delta={-1} />)
    expect(screen.getByTestId("stat-card-delta")).toHaveAttribute("data-trend", "down")
  })

  it("renders a sparkline container when data given", () => {
    render(<StatCard label="A" value="1" sparkline={[1, 2, 3]} />)
    expect(screen.getByTestId("stat-card-sparkline")).toBeInTheDocument()
  })
})
