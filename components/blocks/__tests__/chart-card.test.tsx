import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Bar, BarChart } from "recharts"
import { ChartCard } from "@/components/blocks/chart-card"

const config = { a: { label: "A", color: "var(--chart-1)" } }
const ranges = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
]

describe("ChartCard", () => {
  it("renders title, description and range tabs", async () => {
    const onRangeChange = vi.fn()
    render(
      <ChartCard
        title="Revenue"
        description="Gross"
        ranges={ranges}
        range="7d"
        onRangeChange={onRangeChange}
        config={config}
      >
        <BarChart data={[{ a: 1 }]}>
          <Bar dataKey="a" />
        </BarChart>
      </ChartCard>,
    )
    expect(screen.getByText("Revenue")).toBeInTheDocument()
    expect(screen.getByText("Gross")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("radio", { name: "30 days" }))
    expect(onRangeChange).toHaveBeenCalledWith("30d")
  })

  it("renders without ranges", () => {
    render(
      <ChartCard title="Plain" config={config}>
        <BarChart data={[]}>
          <Bar dataKey="a" />
        </BarChart>
      </ChartCard>,
    )
    expect(screen.queryAllByRole("radio")).toHaveLength(0)
  })
})
