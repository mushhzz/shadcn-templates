import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableSelectColumn,
  createDataTableColumnHelper,
} from "@/components/blocks/data-table"

type Person = { id: string; name: string; age: number }

const people: Person[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: `Person ${String(i + 1).padStart(2, "0")}`,
  age: 20 + ((i * 7) % 30),
}))

const helper = createDataTableColumnHelper<Person>()
const columns = helper.columns([
  DataTableSelectColumn<Person>(),
  helper.accessor("name", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  }),
  helper.accessor("age", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Age" />,
  }),
])

function bodyRows() {
  const table = screen.getByRole("table")
  const [, body] = within(table).getAllByRole("rowgroup")
  return within(body!).getAllByRole("row")
}

describe("DataTable", () => {
  it("paginates at pageSize and navigates", async () => {
    render(<DataTable columns={columns} data={people} pageSize={5} getRowId={(p) => p.id} />)
    expect(bodyRows()).toHaveLength(5)
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /next page/i }))
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument()
  })

  it("sorts by a column when its header is clicked", async () => {
    render(<DataTable columns={columns} data={people} pageSize={12} getRowId={(p) => p.id} />)
    const ageOf = (r: HTMLElement) => Number(within(r).getAllByRole("cell")[2]!.textContent)
    await userEvent.click(screen.getByRole("button", { name: /^Age/ }))
    const asc = bodyRows().map(ageOf)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    await userEvent.click(screen.getByRole("button", { name: /^Age/ }))
    const desc = bodyRows().map(ageOf)
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
  })

  it("reports selected rows", async () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={people}
        pageSize={5}
        getRowId={(p) => p.id}
        onSelectionChange={onSelectionChange}
      />,
    )
    const firstRow = bodyRows()[0]!
    await userEvent.click(within(firstRow).getByRole("checkbox"))
    expect(onSelectionChange).toHaveBeenLastCalledWith([people[0]])
  })

  it("hides a column via the view menu", async () => {
    render(<DataTable columns={columns} data={people} getRowId={(p) => p.id} />)
    await userEvent.click(screen.getByRole("button", { name: /view/i }))
    await userEvent.click(screen.getByRole("menuitemcheckbox", { name: /age/i }))
    expect(screen.queryByRole("button", { name: /^Age/ })).toBeNull()
  })

  it("shows empty message", () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Nothing" />)
    expect(screen.getByText("Nothing")).toBeInTheDocument()
  })
})
