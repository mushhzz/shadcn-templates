"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { BarChart3, LayoutDashboard, Settings, ShoppingCart, Users } from "lucide-react"
import { AppShell, type NavGroup } from "@/components/blocks/app-shell"

const nav: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { title: "Customers", href: "/dashboard/customers", icon: Users },
      { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    ],
  },
  { items: [{ title: "Settings", href: "/dashboard/settings", icon: Settings }] },
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
  return [
    { label: "Dashboard", href: "/dashboard" },
    ...segments.map((s) => ({ label: titles[s] ?? s })),
  ]
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AppShell
      brand={{ name: "Acme", href: "/dashboard" }}
      nav={nav}
      user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD" }}
      breadcrumbs={breadcrumbsFor(pathname)}
      currentPath={pathname}
    >
      {children}
    </AppShell>
  )
}
