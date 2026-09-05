import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { CommandPalette, CommandPaletteTrigger, useCommandPalette } from "@/components/blocks/command-palette"
import { Notifications, type Notification } from "@/components/blocks/notifications"
import { THEME_PRESETS, applyThemeSettings } from "@/components/blocks/theme-customizer"

function PaletteHarness({ onGo }: { onGo: (id: string) => void }) {
  const [open, setOpen] = useCommandPalette()
  return (
    <>
      <CommandPaletteTrigger onClick={() => setOpen(true)} />
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={[
          { heading: "Pages", items: [{ id: "customers", label: "Customers", keywords: ["people"], onSelect: () => onGo("customers") }] },
          { heading: "Actions", items: [{ id: "export", label: "Export report", onSelect: () => onGo("export") }] },
        ]}
      />
    </>
  )
}

describe("CommandPalette", () => {
  it("opens with the keyboard shortcut, filters by keyword and runs the action", async () => {
    const onGo = vi.fn()
    render(<PaletteHarness onGo={onGo} />)
    expect(screen.queryByRole("dialog")).toBeNull()
    await userEvent.keyboard("{Meta>}k{/Meta}")
    const dialog = await screen.findByRole("dialog")
    await userEvent.type(within(dialog).getByRole("combobox"), "people")
    await userEvent.click(within(dialog).getByRole("option", { name: /customers/i }))
    expect(onGo).toHaveBeenCalledWith("customers")
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})

const items: Notification[] = [
  { id: "1", title: "Payment failed", at: new Date(), read: false, kind: "warning" },
  { id: "2", title: "Report ready", at: new Date(), read: true, kind: "info" },
]

describe("Notifications", () => {
  it("announces the unread count and marks items read", async () => {
    const onMarkRead = vi.fn()
    const onMarkAllRead = vi.fn()
    render(<Notifications items={items} onMarkRead={onMarkRead} onMarkAllRead={onMarkAllRead} />)
    await userEvent.click(screen.getByRole("button", { name: /notifications, 1 unread/i }))
    await userEvent.click(await screen.findByRole("button", { name: /payment failed/i }))
    expect(onMarkRead).toHaveBeenCalledWith("1")
    await userEvent.click(screen.getByRole("button", { name: /mark all read/i }))
    expect(onMarkAllRead).toHaveBeenCalled()
  })
})

describe("applyThemeSettings", () => {
  it("sets preset variables on the root and clears them for the neutral preset", () => {
    applyThemeSettings({ preset: "blue", radius: "xl" }, "light")
    const root = document.documentElement
    expect(root.style.getPropertyValue("--primary")).toBe(THEME_PRESETS.find((p) => p.id === "blue")!.light.primary)
    expect(root.style.getPropertyValue("--radius")).toBe("1.25rem")
    applyThemeSettings({ preset: "neutral", radius: "md" }, "light")
    expect(root.style.getPropertyValue("--primary")).toBe("")
    expect(root.style.getPropertyValue("--radius")).toBe("")
  })
})
