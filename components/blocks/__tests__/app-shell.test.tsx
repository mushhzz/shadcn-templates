import { render, screen, within } from "@testing-library/react"
import { Home, Users } from "lucide-react"
import { describe, expect, it } from "vitest"
import { AppShell, type NavGroup } from "@/components/blocks/app-shell"
import { ThemeProvider } from "@/components/blocks/theme-provider"

const nav: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Overview", href: "/dashboard", icon: Home },
      { title: "Customers", href: "/dashboard/customers", icon: Users, badge: "12" },
    ],
  },
]

function renderShell(currentPath = "/dashboard/customers") {
  return render(
    <ThemeProvider>
      <AppShell
        brand={{ name: "Acme", href: "/" }}
        nav={nav}
        user={{ name: "Jane Doe", email: "jane@acme.com", initials: "JD" }}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Customers" }]}
        currentPath={currentPath}
      >
        <p>content</p>
      </AppShell>
    </ThemeProvider>,
  )
}

describe("AppShell", () => {
  it("renders nav items, brand, breadcrumbs and children", () => {
    renderShell()
    expect(screen.getByText("Acme")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Overview/ })).toHaveAttribute("href", "/dashboard")
    expect(screen.getByText("12")).toBeInTheDocument()
    expect(screen.getByText("content")).toBeInTheDocument()
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
  })

  it("marks the current nav item active", () => {
    renderShell("/dashboard/customers")
    // Scope to the sidebar: the breadcrumb page also exposes a link role.
    const sidebar = within(document.querySelector('[data-slot="sidebar-content"]') as HTMLElement)
    const active = sidebar.getByRole("link", { name: /Customers/ })
    expect(active.closest("[data-active]")).toHaveAttribute("data-active", "true")
    const inactive = sidebar.getByRole("link", { name: /Overview/ })
    expect(inactive.closest("[data-active]")).toHaveAttribute("data-active", "false")
  })

  it("renders the theme toggle and user menu trigger", () => {
    renderShell()
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Jane Doe/ })).toBeInTheDocument()
  })
})
