// Visual + accessibility QA against a running server.
//
//   pnpm qa                 # axe (serious/critical fail) + horizontal overflow at 390px on every route
//   pnpm qa --shots         # also writes public/screenshots/<name>.png for the gallery
//   BASE_URL=http://localhost:3000 pnpm qa
//
// Requires: pnpm add -D playwright @axe-core/playwright && pnpm exec playwright install chromium
import { mkdirSync } from "node:fs"
import { chromium } from "playwright"
import AxeBuilder from "@axe-core/playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const SHOTS = process.argv.includes("--shots")

const routes = [
  "/", "/blocks", "/login", "/signup", "/forgot-password", "/maintenance",
  "/dashboard", "/dashboard/analytics", "/dashboard/customers", "/dashboard/orders", "/dashboard/settings",
  "/crm", "/crm/contacts", "/crm/contacts/ct_01", "/crm/companies", "/crm/companies/co_01", "/crm/deals", "/crm/tasks",
  "/chat", "/chat/contacts", "/chat/settings",
  "/agent", "/agent/agents", "/agent/agents/ag_support", "/agent/runs", "/agent/runs/run_9019", "/agent/usage", "/agent/keys",
]

const galleryShots = [
  { name: "dashboard", path: "/dashboard" },
  { name: "crm", path: "/crm/deals" },
  { name: "chat", path: "/chat" },
  { name: "agent", path: "/agent" },
  { name: "auth", path: "/login" },
]

// Known, accepted: the blocks gallery embeds a live app-shell demo, so it has two main landmarks.
const allow = new Set(["/blocks:landmark-no-duplicate-main", "/blocks:landmark-main-is-top-level", "/blocks:landmark-unique"])

const browser = await chromium.launch()
let failures = 0

for (const route of routes) {
  for (const [w, h] of [[1400, 900], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 768 })
    const page = await ctx.newPage()
    const errors = []
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)))
    await page.goto(BASE + route, { waitUntil: "networkidle" })
    await page.waitForTimeout(600)

    const sw = await page.evaluate(() => document.documentElement.scrollWidth)
    if (sw > w + 1) {
      failures++
      console.log(`✖ ${route}@${w}: horizontal overflow (${sw}px)`)
    }
    if (errors.length) {
      failures++
      console.log(`✖ ${route}@${w}: page errors\n    ${errors.join("\n    ")}`)
    }
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"]).exclude("nextjs-portal").analyze()
    for (const v of res.violations) {
      if (allow.has(`${route}:${v.id}`)) continue
      const serious = v.impact === "serious" || v.impact === "critical"
      if (serious) failures++
      console.log(`${serious ? "✖" : "•"} ${route}@${w}: ${v.id} [${v.impact}] ${v.help} — ${v.nodes[0]?.target.join(" ").slice(0, 80)}`)
    }
    await ctx.close()
  }
}

if (SHOTS) {
  mkdirSync("public/screenshots", { recursive: true })
  for (const s of galleryShots) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5, colorScheme: "light" })
    const page = await ctx.newPage()
    await page.addInitScript(() => localStorage.setItem("theme", "light"))
    await page.goto(BASE + s.path, { waitUntil: "networkidle" })
    await page.waitForTimeout(1800)
    // Hide the Next.js dev tools badge if present.
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" })
    await page.screenshot({ path: `public/screenshots/${s.name}.png` })
    console.log(`📸 public/screenshots/${s.name}.png`)
    await ctx.close()
  }
}

await browser.close()
if (failures) {
  console.log(`\n${failures} QA failure(s)`)
  process.exit(1)
}
console.log("\nQA passed")
