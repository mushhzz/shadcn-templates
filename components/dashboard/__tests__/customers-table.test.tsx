import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { CustomersTable } from "@/components/dashboard/customers-table"
import { getCustomers, getOrders } from "@/lib/dashboard/queries"

const now = new Date("2026-09-05T12:00:00Z")

function rows() {
  const [, body] = within(screen.getByRole("table")).getAllByRole("rowgroup")
  return within(body!).getAllByRole("row")
}

describe("CustomersTable", () => {
  it("filters by search text", async () => {
    render(<CustomersTable customers={getCustomers(now)} orders={getOrders(now)} />)
    await userEvent.type(screen.getByPlaceholderText(/search/i), "northwind")
    expect(rows()).toHaveLength(1)
    expect(within(rows()[0]!).getByText("Olivia Bennett")).toBeInTheDocument()
  })

  it("opens a detail sheet on row click", async () => {
    render(<CustomersTable customers={getCustomers(now)} orders={getOrders(now)} />)
    await userEvent.click(screen.getByText("Olivia Bennett"))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("olivia@northwind.io")).toBeInTheDocument()
  })
})
