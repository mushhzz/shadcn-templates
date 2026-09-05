"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Building2, CalendarDays, Download, LayoutDashboard, Moon, Settings, ShoppingCart, Sun, Users } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AppShell, type NavGroup } from "@/components/blocks/app-shell"
import { CommandPalette, CommandPaletteTrigger, useCommandPalette } from "@/components/blocks/command-palette"
import { Notifications, type Notification } from "@/components/blocks/notifications"
import { ThemeCustomizer } from "@/components/blocks/theme-customizer"
import { WorkspaceSwitcher } from "@/components/blocks/workspace-switcher"

const nav: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { title: "Customers", href: "/dashboard/customers", icon: Users },
      { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart, badge: "3" },
    ],
  },
  {
    items: [
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        items: [
          { title: "Profile", href: "/dashboard/settings?tab=profile" },
          { title: "Team", href: "/dashboard/settings?tab=team" },
          { title: "Billing", href: "/dashboard/settings?tab=billing" },
        ],
      },
    ],
  },
]

const workspaces = [
  { id: "acme", name: "Acme", plan: "Team plan", icon: Building2 },
  { id: "acme-labs", name: "Acme Labs", plan: "Pro plan" },
  { id: "personal", name: "Personal", plan: "Free" },
]

const initialNotifications: Notification[] = [
  { id: "n1", title: "Payment failed for Harbor", description: "Card declined twice. The customer has been emailed.", at: new Date(Date.now() - 12 * 60000), read: false, kind: "warning" },
  { id: "n2", title: "New Team plan signup", description: "Olivia Bennett upgraded Northwind to the Team plan.", at: new Date(Date.now() - 48 * 60000), read: false, kind: "success" },
  { id: "n3", title: "Weekly report ready", description: "Your revenue report for last week is ready to download.", at: new Date(Date.now() - 5 * 3600000), read: true, kind: "info" },
  { id: "n4", title: "Marcus mentioned you", description: "\"Can you check the Atlas Works invoice before Thursday?\"", at: new Date(Date.now() - 26 * 3600000), read: true, kind: "message" },
]

const titles: Record<string, string> = {
  analytics: "Analytics",
  customers: "Customers",
  orders: "Orders",
  settings: "Settings",
}

export function breadcrumbsFor(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean).slice(1)
  if (segments.length === 0) return [{ label: "Dashboard" }]
  return [{ label: "Dashboard", href: "/dashboard" }, ...segments.map((s) => ({ label: titles[s] ?? s }))]
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useCommandPalette()
  const [workspace, setWorkspace] = React.useState("acme")
  const [notifications, setNotifications] = React.useState(initialNotifications)

  const pages = nav.flatMap((g) => g.items).map((i) => ({ id: i.href, label: i.title, icon: i.icon, onSelect: () => router.push(i.href) }))

  return (
    <>
      <AppShell
        brand={{ name: "Acme", href: "/dashboard" }}
        nav={nav}
        user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD" }}
        breadcrumbs={breadcrumbsFor(pathname)}
        currentPath={pathname.split("?")[0]}
        sidebarHeader={<WorkspaceSwitcher workspaces={workspaces} activeId={workspace} onChange={setWorkspace} onCreate={() => toast("Workspace creation is mocked")} />}
        headerActions={
          pathname === "/dashboard" ? (
            <>
              <Button variant="outline" size="sm" className="hidden h-8 lg:inline-flex">
                <CalendarDays className="size-4" /> 09 Aug – 05 Sep 2026
              </Button>
              <Button size="sm" className="h-8" aria-label="Download report" onClick={() => toast("Report download started")}>
                <Download className="size-4" /> <span className="hidden sm:inline">Download</span>
              </Button>
            </>
          ) : null
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
              { id: "new-customer", label: "Add customer", icon: Users, shortcut: "⌘N", keywords: ["create"], onSelect: () => toast("Add customer dialog is mocked") },
              { id: "export", label: "Download report", icon: Download, keywords: ["export", "csv"], onSelect: () => toast("Report download started") },
              { id: "theme", label: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode", icon: resolvedTheme === "dark" ? Sun : Moon, onSelect: () => setTheme(resolvedTheme === "dark" ? "light" : "dark") },
            ],
          },
        ]}
      />
    </>
  )
}
