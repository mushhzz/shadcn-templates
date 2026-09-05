"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Activity, BarChart3, Bot, KeyRound, MessageSquare } from "lucide-react"
import { AppShell, type NavGroup } from "@/components/blocks/app-shell"

const nav: NavGroup[] = [
  {
    label: "Build",
    items: [
      { title: "Workspace", href: "/agent", icon: MessageSquare },
      { title: "Agents", href: "/agent/agents", icon: Bot },
    ],
  },
  {
    label: "Observe",
    items: [
      { title: "Runs", href: "/agent/runs", icon: Activity },
      { title: "Usage", href: "/agent/usage", icon: BarChart3 },
      { title: "API keys", href: "/agent/keys", icon: KeyRound },
    ],
  },
]

const titles: Record<string, string> = {
  agents: "Agents",
  runs: "Runs",
  usage: "Usage",
  keys: "API keys",
}

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
  return (
    <AppShell
      brand={{ name: "Relay", href: "/agent", icon: Bot }}
      nav={nav}
      user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD" }}
      breadcrumbs={breadcrumbsFor(pathname)}
      currentPath={pathname}
    >
      {children}
    </AppShell>
  )
}
