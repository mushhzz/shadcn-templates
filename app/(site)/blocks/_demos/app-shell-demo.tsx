"use client"

import { Home, Settings, Users } from "lucide-react"
import { AppShell } from "@/components/blocks/app-shell"

export function AppShellDemo() {
  return (
    // The sidebar panel is position:fixed. A transform makes the demo box its
    // containing block so it stays inside the gallery instead of the viewport.
    <div className="relative h-[420px] overflow-hidden rounded-md border [transform:translateZ(0)] [&_[data-slot=sidebar-inset]]:min-h-0">
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
