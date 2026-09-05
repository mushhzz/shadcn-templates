"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { MessageSquare, Moon, Settings, Sun, Users } from "lucide-react"
import { useTheme } from "next-themes"
import { AppShell, type NavGroup } from "@/components/blocks/app-shell"
import { CommandPalette, CommandPaletteTrigger, useCommandPalette } from "@/components/blocks/command-palette"
import { Notifications, type Notification } from "@/components/blocks/notifications"
import { ThemeCustomizer } from "@/components/blocks/theme-customizer"
import { WorkspaceSwitcher } from "@/components/blocks/workspace-switcher"

const nav: NavGroup[] = [
  {
    items: [
      { title: "Chats", href: "/chat", icon: MessageSquare, badge: "8" },
      { title: "Contacts", href: "/chat/contacts", icon: Users },
      { title: "Settings", href: "/chat/settings", icon: Settings },
    ],
  },
]

const workspaces = [
  { id: "acme", name: "Acme", plan: "12 members" },
  { id: "helio", name: "Helio (guest)", plan: "3 members" },
]

const initialNotifications: Notification[] = [
  { id: "n1", title: "Sam Rivera: Looks perfect now 🙌", at: new Date(Date.now() - 4 * 60000), read: false, kind: "message" },
  { id: "n2", title: "Design review: 2 new messages", at: new Date(Date.now() - 9 * 60000), read: false, kind: "message" },
  { id: "n3", title: "Support escalations: SSO loop resolved", at: new Date(Date.now() - 40 * 60000), read: true, kind: "success" },
]

const titles: Record<string, string> = { contacts: "Contacts", settings: "Settings" }

export function breadcrumbsFor(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean).slice(1)
  if (segments.length === 0) return [{ label: "Chats" }]
  return [{ label: "Chats", href: "/chat" }, ...segments.map((s) => ({ label: titles[s] ?? s }))]
}

export function ChatShell({ children }: { children: React.ReactNode }) {
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
        brand={{ name: "Soho", href: "/chat" }}
        nav={nav}
        user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD" }}
        breadcrumbs={breadcrumbsFor(pathname)}
        currentPath={pathname}
        sidebarHeader={<WorkspaceSwitcher workspaces={workspaces} activeId={workspace} onChange={setWorkspace} />}
        headerTools={
          <>
            <CommandPaletteTrigger onClick={() => setOpen(true)} label="Jump to" />
            <Notifications
              items={notifications}
              onMarkRead={(id) => setNotifications((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)))}
              onMarkAllRead={() => setNotifications((l) => l.map((n) => ({ ...n, read: true })))}
            />
            <ThemeCustomizer />
          </>
        }
        className="gap-4"
      >
        {children}
      </AppShell>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        placeholder="Jump to a page or person…"
        groups={[
          { heading: "Pages", items: pages },
          {
            heading: "People",
            items: [
              { id: "u_sam", label: "Sam Rivera", icon: Users, onSelect: () => router.push("/chat?with=u_sam") },
              { id: "u_marcus", label: "Marcus Lee", icon: Users, onSelect: () => router.push("/chat?with=u_marcus") },
              { id: "u_ava", label: "Ava Nguyen", icon: Users, onSelect: () => router.push("/chat?with=u_ava") },
            ],
          },
          {
            heading: "Actions",
            items: [{ id: "theme", label: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode", icon: resolvedTheme === "dark" ? Sun : Moon, onSelect: () => setTheme(resolvedTheme === "dark" ? "light" : "dark") }],
          },
        ]}
      />
    </>
  )
}
