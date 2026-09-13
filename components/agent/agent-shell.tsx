"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Activity, BarChart3, Bot, KeyRound, MessageSquare, Moon, Plus, Sun } from "lucide-react"
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
    label: "Build",
    items: [
      { title: "Workspace", href: "/agent", icon: MessageSquare },
      { title: "Agents", href: "/agent/agents", icon: Bot, badge: "5" },
    ],
  },
  {
    label: "Observe",
    items: [
      { title: "Runs", href: "/agent/runs", icon: Activity, badge: "1" },
      { title: "Usage", href: "/agent/usage", icon: BarChart3 },
      { title: "API keys", href: "/agent/keys", icon: KeyRound },
    ],
  },
]

const workspaces = [
  { id: "prod", name: "Relay · Production", plan: "Scale plan", icon: Bot },
  { id: "staging", name: "Relay · Staging", plan: "Dev plan" },
]

const initialNotifications: Notification[] = [
  { id: "n1", title: "run_9019 failed", description: "send_email timed out after 3s (Support Copilot).", at: new Date(Date.now() - 42 * 60000), read: false, kind: "warning" },
  { id: "n2", title: "Spend is 78% of the monthly budget", description: "$306 of $400 used with 9 days left.", at: new Date(Date.now() - 3 * 3600000), read: false, kind: "info" },
  { id: "n3", title: "Research Scout brief ready", description: "briefs/meridian-competitors.md was written.", at: new Date(Date.now() - 3 * 3600000), read: true, kind: "success" },
]

const titles: Record<string, string> = { agents: "Agents", runs: "Runs", usage: "Usage", keys: "API keys" }

export function breadcrumbsFor(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean).slice(1)
  if (segments.length === 0) return [{ label: "Workspace" }]
  const crumbs: { label: string; href?: string }[] = [{ label: "Agent", href: "/agent" }]
  segments.forEach((s, i) => {
    const last = i === segments.length - 1
    const label = titles[s] ?? s
    crumbs.push(last ? { label } : { label, href: `/agent/${segments.slice(0, i + 1).join("/")}` })
  })
  return crumbs
}

export function AgentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useCommandPalette()
  const [workspace, setWorkspace] = React.useState("prod")
  const [notifications, setNotifications] = React.useState(initialNotifications)
  const pages = nav.flatMap((g) => g.items).map((i) => ({ id: i.href, label: i.title, icon: i.icon, onSelect: () => router.push(i.href) }))

  return (
    <>
      <AppShell
        brand={{ name: "Relay", href: "/agent", icon: Bot }}
        nav={nav}
        user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD", avatar: personAvatar("Jane Doe") }}
        breadcrumbs={breadcrumbsFor(pathname)}
        currentPath={pathname}
        sidebarHeader={<WorkspaceSwitcher workspaces={workspaces} activeId={workspace} onChange={setWorkspace} onCreate={() => toast("Workspace creation is mocked")} />}
        headerActions={
          pathname === "/agent/agents" ? (
            <Button size="sm" className="h-8" aria-label="New agent" onClick={() => toast("New agent dialog is mocked")}>
              <Plus className="size-4" /> <span className="hidden sm:inline">New agent</span>
            </Button>
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
        className={pathname === "/agent" ? "gap-4" : undefined}
      >
        {children}
      </AppShell>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={[
          { heading: "Pages", items: pages },
          {
            heading: "Agents",
            items: [
              { id: "ag_support", label: "Support Copilot", icon: Bot, onSelect: () => router.push("/agent/agents/ag_support") },
              { id: "ag_analyst", label: "Revenue Analyst", icon: Bot, onSelect: () => router.push("/agent/agents/ag_analyst") },
              { id: "ag_research", label: "Research Scout", icon: Bot, onSelect: () => router.push("/agent/agents/ag_research") },
            ],
          },
          {
            heading: "Actions",
            items: [
              { id: "new-agent", label: "New agent", icon: Plus, shortcut: "⌘N", onSelect: () => toast("New agent dialog is mocked") },
              { id: "new-key", label: "Create API key", icon: KeyRound, onSelect: () => router.push("/agent/keys") },
              { id: "theme", label: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode", icon: resolvedTheme === "dark" ? Sun : Moon, onSelect: () => setTheme(resolvedTheme === "dark" ? "light" : "dark") },
            ],
          },
        ]}
      />
    </>
  )
}
