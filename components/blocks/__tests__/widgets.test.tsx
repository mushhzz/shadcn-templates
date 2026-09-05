import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DonutChart } from "@/components/blocks/donut-chart"
import { HighlightCard } from "@/components/blocks/highlight-card"
import { ProgressList } from "@/components/blocks/progress-list"
import { RatingBreakdown } from "@/components/blocks/rating-breakdown"

describe("widgets", () => {
  it("ProgressList scales bars to the largest value and shows deltas", () => {
    render(
      <ProgressList
        title="Sales by region"
        items={[
          { id: "a", label: "Canada", value: 85, delta: 5.2 },
          { id: "b", label: "Russia", value: 42.5, delta: -2.1 },
        ]}
        max={100}
      />,
    )
    expect(screen.getByLabelText("Canada: 85%")).toBeInTheDocument()
    expect(screen.getByLabelText("Russia: 43%")).toBeInTheDocument()
    expect(screen.getByText("+5.2%")).toBeInTheDocument()
    expect(screen.getByText("-2.1%")).toBeInTheDocument()
  })

  it("RatingBreakdown computes the average and per-star percentages", () => {
    render(<RatingBreakdown title="Reviews" counts={[4000, 2100, 800, 631, 344]} />)
    expect(screen.getByLabelText("4.1 out of 5")).toBeInTheDocument()
    expect(screen.getByText("7,875 reviews")).toBeInTheDocument()
    expect(screen.getByLabelText("5 stars: 51%")).toBeInTheDocument()
  })

  it("DonutChart lists slices with percentages of the total", () => {
    render(
      <DonutChart
        title="Visits by source"
        data={[
          { key: "direct", label: "Direct", value: 600 },
          { key: "search", label: "Search", value: 400 },
        ]}
      />,
    )
    expect(screen.getByText("60%")).toBeInTheDocument()
    expect(screen.getByText("40%")).toBeInTheDocument()
  })

  it("HighlightCard renders headline value and action", () => {
    render(<HighlightCard eyebrow="Best month" title="Congratulations, Toby!" value="$15,231.89" delta="+65% from last month" action={<button>View sales</button>} />)
    expect(screen.getByRole("heading", { name: /congratulations/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "View sales" })).toBeInTheDocument()
  })
})
