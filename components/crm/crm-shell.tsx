"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Building2, CheckSquare, Contact, Kanban, LayoutDashboard } from "lucide-react"
import { AppShell, type NavGroup } from "@/components/blocks/app-shell"

const nav: NavGroup[] = [
  {
    label: "Sales",
    items: [
      { title: "Overview", href: "/crm", icon: LayoutDashboard },
      { title: "Contacts", href: "/crm/contacts", icon: Contact },
      { title: "Companies", href: "/crm/companies", icon: Building2 },
      { title: "Deals", href: "/crm/deals", icon: Kanban },
      { title: "Tasks", href: "/crm/tasks", icon: CheckSquare },
    ],
  },
]

const titles: Record<string, string> = {
  contacts: "Contacts",
  companies: "Companies",
  deals: "Deals",
  tasks: "Tasks",
}

export function breadcrumbsFor(
  pathname: string,
  leaf?: string,
): { label: string; href?: string }[] {
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
  return (
    <AppShell
      brand={{ name: "Acme CRM", href: "/crm" }}
      nav={nav}
      user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD" }}
      breadcrumbs={breadcrumbsFor(pathname, "Detail")}
      currentPath={pathname}
    >
      {children}
    </AppShell>
  )
}
