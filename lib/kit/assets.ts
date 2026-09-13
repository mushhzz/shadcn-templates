/**
 * Illustrated assets that ship with the kit under /kit. Everything is a small SVG in the kit
 * palette, so it works in both colour schemes and installs through the registry as plain files.
 *
 * People, companies, agents and products are keyed by display name so the same person gets the
 * same face in every template. Unknown names fall back to `undefined`, and the Avatar primitive
 * then shows initials.
 */

export const KIT_ASSET_BASE = "/kit"

const PEOPLE: Record<string, string> = {
  "Jane Doe": "a36",
  "Sam Rivera": "a30",
  "Priya Raman": "a16",
  "Marcus Lee": "a17",
  "Lena Fischer": "a26",
  "Tom Becker": "a15",
  "Olivia Bennett": "a01",
  "Rahul Mehta": "a10",
  "Liam Carter": "a03",
  "Ava Nguyen": "a18",
  "Noah Patel": "a05",
  "Sophia Rossi": "a06",
  "Ethan Kim": "a23",
  "Grace Whitfield": "a08",
  "Isabella Moreau": "a13",
  "Diego Alvarez": "a07",
  "Mason Okafor": "a11",
  "Mia Fischer": "a04",
  "Charlotte Dubois": "a14",
  "Hannah Weiss": "a20",
  "Kenji Watanabe": "a31",
  "Amara Osei": "a28",
  "Lucas Silva": "a29",
  "James Walsh": "a21",
  "Amelia Novak": "a24",
  "Benjamin Adeyemi": "a19",
  "Harper Lindqvist": "a09",
  "Elijah Brooks": "a02",
  "Evelyn Sato": "a22",
  "Henry Olsen": "a27",
  "Abigail Reyes": "a32",
  "Alexander Ivanov": "a25",
  "Emily Zhang": "a12",
  "Daniel Haddad": "a33",
  "Ella Thompson": "a34",
  "Sebastian Costa": "a35",
}

const COMPANIES: Record<string, string> = {
  Acme: "acme",
  Northwind: "northwind",
  Lumen: "lumen",
  Helio: "helio",
  Brightline: "brightline",
  Vetra: "vetra",
  Quill: "quill",
  "Atlas Works": "atlas-works",
  Fern: "fern",
  Stratus: "stratus",
  Harbor: "harbor",
  "Meridian Labs": "meridian-labs",
}

const AGENTS: Record<string, string> = {
  "Support Copilot": "support-copilot",
  "Revenue Analyst": "revenue-analyst",
  "Research Scout": "research-scout",
  "Meeting Scheduler": "meeting-scheduler",
  "Onboarding Guide": "onboarding-guide",
}

const PRODUCTS: Record<string, string> = {
  "Starter Plan": "starter-plan",
  "Pro Plan": "pro-plan",
  "Team Plan": "team-plan",
  "Extra Seat": "extra-seat",
  "Priority Support": "priority-support",
  "Onboarding Session": "onboarding-session",
  "API Overage (10k)": "api-overage",
}

export type EmptyIllustration =
  | "search"
  | "tasks"
  | "contacts"
  | "messages"
  | "runs"
  | "error"
  | "notifications"
  | "files"

/** Avatar for a person, keyed by display name. */
export function personAvatar(name: string): string | undefined {
  const id = PEOPLE[name]
  return id ? `${KIT_ASSET_BASE}/avatars/${id}.svg` : undefined
}

/** Monochrome logo mark for a company, keyed by display name. */
export function companyLogo(name: string): string | undefined {
  const id = COMPANIES[name]
  return id ? `${KIT_ASSET_BASE}/logos/${id}.svg` : undefined
}

/** Avatar tile for an AI agent, keyed by agent name. */
export function agentAvatar(name: string): string | undefined {
  const id = AGENTS[name]
  return id ? `${KIT_ASSET_BASE}/agents/${id}.svg` : undefined
}

/** Product icon, keyed by product name. */
export function productImage(name: string): string | undefined {
  const id = PRODUCTS[name]
  return id ? `${KIT_ASSET_BASE}/products/${id}.svg` : undefined
}

/** Empty-state illustration. */
export function emptyIllustration(kind: EmptyIllustration): string {
  return `${KIT_ASSET_BASE}/empty/${kind}.svg`
}

export const KIT_ART = {
  authPanel: `${KIT_ASSET_BASE}/art/auth-panel.svg`,
  hero: `${KIT_ASSET_BASE}/art/hero.svg`,
} as const
