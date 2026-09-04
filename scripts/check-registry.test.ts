import { describe, expect, it } from "vitest"
import { checkRegistry, type Registry } from "./check-registry"

const base: Registry = {
  name: "kit",
  homepage: "https://x",
  items: [],
}

const exists = (paths: string[]) => (p: string) => paths.includes(p)
const noRead = () => ""

describe("checkRegistry", () => {
  it("passes for an empty registry", () => {
    expect(checkRegistry(base, { fileExists: exists([]), readFile: noRead })).toEqual([])
  })

  it("reports missing files", () => {
    const reg: Registry = {
      ...base,
      items: [
        {
          name: "page-header",
          type: "registry:block",
          files: [{ path: "components/blocks/page-header.tsx", type: "registry:component" }],
        },
      ],
    }
    const errors = checkRegistry(reg, { fileExists: exists([]), readFile: noRead })
    expect(errors).toContain("page-header: missing file components/blocks/page-header.tsx")
  })

  it("reports unresolved local registryDependencies", () => {
    const reg: Registry = {
      ...base,
      items: [
        {
          name: "stat-card",
          type: "registry:block",
          registryDependencies: ["card", "@kit/sparkline", "./missing.json"],
          files: [],
        },
      ],
    }
    const errors = checkRegistry(reg, { fileExists: exists([]), readFile: noRead })
    expect(errors).toContain("stat-card: unresolved registryDependency @kit/sparkline")
    expect(errors).toContain("stat-card: unresolved registryDependency ./missing.json")
  })

  it("accepts local registryDependencies that exist and built-in names", () => {
    const reg: Registry = {
      ...base,
      items: [
        { name: "a", type: "registry:block", files: [] },
        { name: "b", type: "registry:block", registryDependencies: ["card", "@kit/a", "./a.json"], files: [] },
      ],
    }
    expect(checkRegistry(reg, { fileExists: exists([]), readFile: noRead })).toEqual([])
  })

  it("rejects block files importing from a template folder", () => {
    const reg: Registry = {
      ...base,
      items: [
        {
          name: "app-shell",
          type: "registry:block",
          files: [{ path: "components/blocks/app-shell.tsx", type: "registry:component" }],
        },
      ],
    }
    const src = `import { x } from "@/components/dashboard/nav"`
    const errors = checkRegistry(reg, {
      fileExists: exists(["components/blocks/app-shell.tsx"]),
      readFile: () => src,
    })
    expect(errors).toContain(
      "app-shell: components/blocks/app-shell.tsx imports template code @/components/dashboard/nav",
    )
  })

  it("requires target on registry:page files", () => {
    const reg: Registry = {
      ...base,
      items: [
        {
          name: "dashboard",
          type: "registry:block",
          files: [{ path: "app/(preview)/dashboard/page.tsx", type: "registry:page" }],
        },
      ],
    }
    const errors = checkRegistry(reg, {
      fileExists: exists(["app/(preview)/dashboard/page.tsx"]),
      readFile: noRead,
    })
    expect(errors).toContain("dashboard: app/(preview)/dashboard/page.tsx is registry:page without target")
  })
})
