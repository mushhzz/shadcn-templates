import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PageHeader } from "@/components/blocks/page-header"

describe("PageHeader", () => {
  it("renders title, description and actions", () => {
    render(
      <PageHeader title="Customers" description="All accounts" actions={<button>New</button>} />,
    )
    expect(screen.getByRole("heading", { level: 1, name: "Customers" })).toBeInTheDocument()
    expect(screen.getByText("All accounts")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument()
  })

  it("omits description when not provided", () => {
    render(<PageHeader title="Orders" />)
    expect(screen.queryByTestId("page-header-description")).toBeNull()
  })
})
