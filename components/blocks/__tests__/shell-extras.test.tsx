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
  it("sets preset variables on the root and swaps them when the preset changes", () => {
    applyThemeSettings({ preset: "ocean", radius: "xl" }, "light")
    const root = document.documentElement
    const ocean = THEME_PRESETS.find((p) => p.id === "ocean")!
    expect(root.style.getPropertyValue("--primary")).toBe(ocean.light.primary)
    expect(root.style.getPropertyValue("--hue")).toBe(ocean.light.hue)
    expect(root.style.getPropertyValue("--radius")).toBe("1.25rem")
    applyThemeSettings({ preset: "ink", radius: "md" }, "light")
    const ink = THEME_PRESETS.find((p) => p.id === "ink")!
    expect(root.style.getPropertyValue("--primary")).toBe(ink.light.primary)
    expect(root.style.getPropertyValue("--radius")).toBe("")
  })

  it("keeps brand surfaces deep in dark mode", () => {
    for (const p of THEME_PRESETS) {
      const l = Number(/oklch\(([\d.]+)/.exec(p.dark.brand)![1])
      expect(l, p.id).toBeLessThan(0.6)
    }
  })
})
