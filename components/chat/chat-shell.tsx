"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { MessageSquare, Settings, Users } from "lucide-react"
import { AppShell, type NavGroup } from "@/components/blocks/app-shell"

const nav: NavGroup[] = [
  {
    items: [
      { title: "Chats", href: "/chat", icon: MessageSquare, badge: "8" },
      { title: "Contacts", href: "/chat/contacts", icon: Users },
      { title: "Settings", href: "/chat/settings", icon: Settings },
    ],
  },
]

const titles: Record<string, string> = { contacts: "Contacts", settings: "Settings" }

export function breadcrumbsFor(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean).slice(1)
  if (segments.length === 0) return [{ label: "Chats" }]
  return [{ label: "Chats", href: "/chat" }, ...segments.map((s) => ({ label: titles[s] ?? s }))]
}

export function ChatShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AppShell
      brand={{ name: "Soho", href: "/chat" }}
      nav={nav}
      user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD" }}
      breadcrumbs={breadcrumbsFor(pathname)}
      currentPath={pathname}
    >
      {children}
    </AppShell>
  )
}
