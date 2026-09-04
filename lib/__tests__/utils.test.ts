import { describe, expect, it } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("merges tailwind classes and drops conflicts", () => {
    expect(cn("p-2", "p-4", false && "hidden")).toBe("p-4")
  })
})
