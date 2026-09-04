"use client"

import { Home, Settings, Users } from "lucide-react"
import { AppShell } from "@/components/blocks/app-shell"

export function AppShellDemo() {
  return (
    <div className="h-[420px] overflow-hidden rounded-md border">
      <AppShell
        brand={{ name: "Acme", href: "#" }}
        nav={[
          {
            label: "Main",
            items: [
              { title: "Overview", href: "#overview", icon: Home },
              { title: "Customers", href: "#customers", icon: Users, badge: "12" },
            ],
          },
          { items: [{ title: "Settings", href: "#settings", icon: Settings }] },
        ]}
        user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD" }}
        breadcrumbs={[{ label: "Acme", href: "#" }, { label: "Overview" }]}
        currentPath="#overview"
      >
        <p className="text-sm text-muted-foreground">Page content renders here.</p>
      </AppShell>
    </div>
  )
}
