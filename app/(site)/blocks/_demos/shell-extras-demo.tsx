"use client"

import * as React from "react"
import { Bot, Building2, FileText, Home, Plus, Settings, Users } from "lucide-react"
import { toast } from "sonner"
import { SidebarProvider } from "@/components/ui/sidebar"
import { CommandPalette, CommandPaletteTrigger, useCommandPalette } from "@/components/blocks/command-palette"
import { Notifications, type Notification } from "@/components/blocks/notifications"
import { ThemeCustomizer } from "@/components/blocks/theme-customizer"
import { WorkspaceSwitcher } from "@/components/blocks/workspace-switcher"

const workspaces = [
  { id: "acme", name: "Acme", plan: "Team plan", icon: Building2 },
  { id: "labs", name: "Acme Labs", plan: "Pro plan", icon: Bot },
]

const initial: Notification[] = [
  { id: "1", title: "Payment failed for Harbor", description: "Card declined twice.", at: new Date(Date.now() - 12 * 60000), read: false, kind: "warning" },
  { id: "2", title: "Olivia upgraded to Team", at: new Date(Date.now() - 50 * 60000), read: false, kind: "success" },
  { id: "3", title: "Weekly report ready", at: new Date(Date.now() - 5 * 3600000), read: true, kind: "info" },
]

export function CommandPaletteDemo() {
  const [open, setOpen] = useCommandPalette()
  return (
    <div className="flex flex-wrap items-center gap-3">
      <CommandPaletteTrigger onClick={() => setOpen(true)} />
      <span className="text-sm text-muted-foreground">or press ⌘K</span>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={[
          {
            heading: "Pages",
            items: [
              { id: "home", label: "Overview", icon: Home, onSelect: () => toast("Overview") },
              { id: "customers", label: "Customers", icon: Users, onSelect: () => toast("Customers") },
              { id: "settings", label: "Settings", icon: Settings, shortcut: "⌘,", onSelect: () => toast("Settings") },
            ],
          },
          {
            heading: "Actions",
            items: [
              { id: "new", label: "New document", icon: Plus, shortcut: "⌘N", keywords: ["create"], onSelect: () => toast("New document") },
              { id: "export", label: "Export report", icon: FileText, keywords: ["csv", "download"], onSelect: () => toast("Exported") },
            ],
          },
        ]}
      />
    </div>
  )
}

export function NotificationsDemo() {
  const [items, setItems] = React.useState(initial)
  return (
    <div className="flex items-center gap-3">
      <Notifications
        items={items}
        onMarkRead={(id) => setItems((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)))}
        onMarkAllRead={() => setItems((l) => l.map((n) => ({ ...n, read: true })))}
        onOpen={(n) => toast(n.title)}
      />
      <span className="text-sm text-muted-foreground">{items.filter((n) => !n.read).length} unread</span>
    </div>
  )
}

export function WorkspaceSwitcherDemo() {
  const [active, setActive] = React.useState("acme")
  return (
    <SidebarProvider className="min-h-0">
      <div className="w-64 rounded-md border bg-sidebar p-2">
        <WorkspaceSwitcher workspaces={workspaces} activeId={active} onChange={setActive} onCreate={() => toast("Add workspace")} />
      </div>
    </SidebarProvider>
  )
}

export function ThemeCustomizerDemo() {
  return (
    <div className="flex items-center gap-3">
      <ThemeCustomizer />
      <span className="text-sm text-muted-foreground">Presets apply to this whole site and persist in your browser.</span>
    </div>
  )
}
