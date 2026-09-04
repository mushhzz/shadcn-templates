import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Composer } from "@/components/blocks/composer"

describe("Composer", () => {
  it("sends trimmed text on Enter and clears", async () => {
    const onSend = vi.fn()
    render(<Composer onSend={onSend} />)
    const box = screen.getByRole("textbox")
    await userEvent.type(box, "  hello  {Enter}")
    expect(onSend).toHaveBeenCalledWith("hello")
    expect(box).toHaveValue("")
  })

  it("inserts newline on Shift+Enter and does not send", async () => {
    const onSend = vi.fn()
    render(<Composer onSend={onSend} />)
    const box = screen.getByRole("textbox")
    await userEvent.type(box, "a{Shift>}{Enter}{/Shift}b")
    expect(onSend).not.toHaveBeenCalled()
    expect(box).toHaveValue("a\nb")
  })

  it("ignores empty submissions and disables send button", async () => {
    const onSend = vi.fn()
    render(<Composer onSend={onSend} />)
    const send = screen.getByRole("button", { name: /send/i })
    expect(send).toBeDisabled()
    await userEvent.click(send)
    expect(onSend).not.toHaveBeenCalled()
  })
})
