import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { InstallCommand } from "@/components/site/install-command"

describe("InstallCommand", () => {
  it("renders the command and copies it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<InstallCommand item="app-shell" />)
    expect(screen.getByText("npx shadcn@latest add @kit/app-shell")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /copy/i }))
    expect(writeText).toHaveBeenCalledWith("npx shadcn@latest add @kit/app-shell")
  })
})
