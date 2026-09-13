"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Building2, CheckSquare, Contact, Kanban, LayoutDashboard, Plus, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AppShell, type NavGroup } from "@/components/blocks/app-shell"
import { CommandPalette, CommandPaletteTrigger, useCommandPalette } from "@/components/blocks/command-palette"
import { Notifications, type Notification } from "@/components/blocks/notifications"
import { ThemeCustomizer } from "@/components/blocks/theme-customizer"
import { WorkspaceSwitcher } from "@/components/blocks/workspace-switcher"
import { personAvatar } from "@/lib/kit/assets"

const nav: NavGroup[] = [
  {
    label: "Sales",
    items: [
      { title: "Overview", href: "/crm", icon: LayoutDashboard },
      { title: "Contacts", href: "/crm/contacts", icon: Contact },
      { title: "Companies", href: "/crm/companies", icon: Building2 },
      { title: "Deals", href: "/crm/deals", icon: Kanban, badge: "13" },
      { title: "Tasks", href: "/crm/tasks", icon: CheckSquare, badge: "2" },
    ],
  },
]

const workspaces = [
  { id: "sales", name: "Acme Sales", plan: "Team plan", icon: Building2 },
  { id: "partners", name: "Partner channel", plan: "Pro plan" },
]

const initialNotifications: Notification[] = [
  { id: "n1", title: "Task overdue: Send revised proposal to Northwind", at: new Date(Date.now() - 24 * 3600000), read: false, kind: "warning" },
  { id: "n2", title: "Lumen grid analytics closed won", description: "$62,000 · Marcus Lee", at: new Date(Date.now() - 8 * 24 * 3600000), read: false, kind: "success" },
  { id: "n3", title: "Meridian legal wants a DPA addendum", description: "Jane Doe left a note on Meridian research cloud.", at: new Date(Date.now() - 8 * 3600000), read: true, kind: "message" },
]

const titles: Record<string, string> = { contacts: "Contacts", companies: "Companies", deals: "Deals", tasks: "Tasks" }

export function breadcrumbsFor(pathname: string, leaf?: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean).slice(1)
  if (segments.length === 0) return [{ label: "CRM" }]
  const crumbs: { label: string; href?: string }[] = [{ label: "CRM", href: "/crm" }]
  segments.forEach((s, i) => {
    const last = i === segments.length - 1
    const label = titles[s] ?? leaf ?? s
    crumbs.push(last ? { label } : { label, href: `/crm/${segments.slice(0, i + 1).join("/")}` })
  })
  return crumbs
}

export function CrmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useCommandPalette()
  const [workspace, setWorkspace] = React.useState("sales")
  const [notifications, setNotifications] = React.useState(initialNotifications)
  const pages = nav.flatMap((g) => g.items).map((i) => ({ id: i.href, label: i.title, icon: i.icon, onSelect: () => router.push(i.href) }))

  return (
    <>
      <AppShell
        brand={{ name: "Acme CRM", href: "/crm" }}
        nav={nav}
        user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD", avatar: personAvatar("Jane Doe") }}
        breadcrumbs={breadcrumbsFor(pathname, "Detail")}
        currentPath={pathname}
        sidebarHeader={<WorkspaceSwitcher workspaces={workspaces} activeId={workspace} onChange={setWorkspace} />}
        headerActions={
          <Button size="sm" className="h-8" aria-label="New deal" onClick={() => toast("New deal dialog is mocked")}>
            <Plus className="size-4" /> <span className="hidden sm:inline">New deal</span>
          </Button>
        }
        headerTools={
          <>
            <CommandPaletteTrigger onClick={() => setOpen(true)} />
            <Notifications
              items={notifications}
              onMarkRead={(id) => setNotifications((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)))}
              onMarkAllRead={() => setNotifications((l) => l.map((n) => ({ ...n, read: true })))}
            />
            <ThemeCustomizer />
          </>
        }
      >
        {children}
      </AppShell>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={[
          { heading: "Pages", items: pages },
          {
            heading: "Actions",
            items: [
              { id: "new-deal", label: "New deal", icon: Plus, shortcut: "⌘N", onSelect: () => toast("New deal dialog is mocked") },
              { id: "new-contact", label: "Add contact", icon: Contact, onSelect: () => toast("Add contact dialog is mocked") },
              { id: "theme", label: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode", icon: resolvedTheme === "dark" ? Sun : Moon, onSelect: () => setTheme(resolvedTheme === "dark" ? "light" : "dark") },
            ],
          },
        ]}
      />
    </>
  )
}
