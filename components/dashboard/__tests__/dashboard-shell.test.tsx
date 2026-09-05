import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/customers",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

import { DashboardShell, breadcrumbsFor } from "@/components/dashboard/dashboard-shell"
import { ThemeProvider } from "@/components/blocks/theme-provider"

describe("breadcrumbsFor", () => {
  it("maps paths to crumbs", () => {
    expect(breadcrumbsFor("/dashboard")).toEqual([{ label: "Dashboard" }])
    expect(breadcrumbsFor("/dashboard/customers")).toEqual([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Customers" },
    ])
  })
})

describe("DashboardShell", () => {
  it("renders nav and children", () => {
    render(
      <ThemeProvider>
        <DashboardShell>
          <p>inner</p>
        </DashboardShell>
      </ThemeProvider>,
    )
    expect(screen.getByText("inner")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Analytics/ })).toHaveAttribute(
      "href",
      "/dashboard/analytics",
    )
  })
})
