import type {
  Activity,
  Customer,
  Invoice,
  MonthlyMetric,
  Order,
  Product,
  TeamMember,
} from "./types"

const DAY = 60 * 24

export const customers: Customer[] = [
  { id: "cus_01", name: "Olivia Bennett", email: "olivia@northwind.io", company: "Northwind", status: "active", plan: "Team", lifetimeValue: 18420, createdMinutesAgo: DAY * 410 },
  { id: "cus_02", name: "Liam Carter", email: "liam@lumen.co", company: "Lumen", status: "active", plan: "Pro", lifetimeValue: 6240, createdMinutesAgo: DAY * 320 },
  { id: "cus_03", name: "Ava Nguyen", email: "ava@helio.dev", company: "Helio", status: "trial", plan: "Free", lifetimeValue: 0, createdMinutesAgo: DAY * 6 },
  { id: "cus_04", name: "Noah Patel", email: "noah@brightline.com", company: "Brightline", status: "active", plan: "Pro", lifetimeValue: 4110, createdMinutesAgo: DAY * 210 },
  { id: "cus_05", name: "Sophia Rossi", email: "sophia@vetra.app", company: "Vetra", status: "churned", plan: "Pro", lifetimeValue: 2980, createdMinutesAgo: DAY * 540 },
  { id: "cus_06", name: "Ethan Kim", email: "ethan@quill.so", company: "Quill", status: "active", plan: "Team", lifetimeValue: 22750, createdMinutesAgo: DAY * 700 },
  { id: "cus_07", name: "Isabella Moreau", email: "isabella@atlasworks.com", company: "Atlas Works", status: "active", plan: "Pro", lifetimeValue: 5890, createdMinutesAgo: DAY * 150 },
  { id: "cus_08", name: "Mason Okafor", email: "mason@fernhq.com", company: "Fern", status: "trial", plan: "Free", lifetimeValue: 0, createdMinutesAgo: DAY * 2 },
  { id: "cus_09", name: "Mia Fischer", email: "mia@stratus.fm", company: "Stratus", status: "active", plan: "Pro", lifetimeValue: 7320, createdMinutesAgo: DAY * 260 },
  { id: "cus_10", name: "Lucas Silva", email: "lucas@harbor.tools", company: "Harbor", status: "churned", plan: "Free", lifetimeValue: 340, createdMinutesAgo: DAY * 480 },
  { id: "cus_11", name: "Charlotte Dubois", email: "charlotte@meridianlabs.com", company: "Meridian Labs", status: "active", plan: "Team", lifetimeValue: 31200, createdMinutesAgo: DAY * 820 },
  { id: "cus_12", name: "James Walsh", email: "james@copperleaf.co", company: "Copperleaf", status: "active", plan: "Pro", lifetimeValue: 3990, createdMinutesAgo: DAY * 95 },
  { id: "cus_13", name: "Amelia Novak", email: "amelia@pinefield.org", company: "Pinefield", status: "active", plan: "Free", lifetimeValue: 620, createdMinutesAgo: DAY * 40 },
  { id: "cus_14", name: "Benjamin Adeyemi", email: "ben@ridgeline.ai", company: "Ridgeline", status: "trial", plan: "Free", lifetimeValue: 0, createdMinutesAgo: DAY * 1 },
  { id: "cus_15", name: "Harper Lindqvist", email: "harper@solace.health", company: "Solace", status: "active", plan: "Pro", lifetimeValue: 8460, createdMinutesAgo: DAY * 300 },
  { id: "cus_16", name: "Elijah Brooks", email: "elijah@tidewater.co", company: "Tidewater", status: "churned", plan: "Team", lifetimeValue: 12100, createdMinutesAgo: DAY * 610 },
  { id: "cus_17", name: "Evelyn Sato", email: "evelyn@kestrel.io", company: "Kestrel", status: "active", plan: "Pro", lifetimeValue: 5210, createdMinutesAgo: DAY * 180 },
  { id: "cus_18", name: "Henry Olsen", email: "henry@granite.build", company: "Granite", status: "active", plan: "Team", lifetimeValue: 27600, createdMinutesAgo: DAY * 760 },
  { id: "cus_19", name: "Abigail Reyes", email: "abigail@sunder.app", company: "Sunder", status: "active", plan: "Free", lifetimeValue: 180, createdMinutesAgo: DAY * 22 },
  { id: "cus_20", name: "Alexander Ivanov", email: "alex@orbitalpay.com", company: "Orbital Pay", status: "active", plan: "Pro", lifetimeValue: 9870, createdMinutesAgo: DAY * 350 },
  { id: "cus_21", name: "Emily Zhang", email: "emily@wavelength.fm", company: "Wavelength", status: "trial", plan: "Free", lifetimeValue: 0, createdMinutesAgo: DAY * 4 },
  { id: "cus_22", name: "Daniel Haddad", email: "daniel@cinderworks.com", company: "Cinderworks", status: "active", plan: "Pro", lifetimeValue: 4560, createdMinutesAgo: DAY * 130 },
  { id: "cus_23", name: "Ella Thompson", email: "ella@fable.studio", company: "Fable Studio", status: "active", plan: "Team", lifetimeValue: 15900, createdMinutesAgo: DAY * 450 },
  { id: "cus_24", name: "Sebastian Costa", email: "seb@verdant.farm", company: "Verdant", status: "churned", plan: "Pro", lifetimeValue: 1720, createdMinutesAgo: DAY * 390 },
]

export const products: Product[] = [
  { id: "prd_01", name: "Starter Plan", price: 29, category: "Subscription" },
  { id: "prd_02", name: "Pro Plan", price: 79, category: "Subscription" },
  { id: "prd_03", name: "Team Plan", price: 249, category: "Subscription" },
  { id: "prd_04", name: "Extra Seat", price: 15, category: "Add-on" },
  { id: "prd_05", name: "Priority Support", price: 120, category: "Add-on" },
  { id: "prd_06", name: "Onboarding Session", price: 450, category: "Services" },
  { id: "prd_07", name: "API Overage (10k)", price: 40, category: "Usage" },
  { id: "prd_08", name: "Storage 100GB", price: 25, category: "Usage" },
]

// Fixed-seed LCG so the 40 orders are deterministic without hand-typing each row.
function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

const statusPool: Order["status"][] = ["paid", "paid", "paid", "paid", "pending", "paid", "refunded", "paid", "failed", "paid"]
const channelPool: Order["channel"][] = ["web", "web", "mobile", "web", "partner", "mobile"]

function pick<T>(list: T[], r: number): T {
  return list[Math.min(list.length - 1, Math.floor(r * list.length))] as T
}

export const orders: Order[] = (() => {
  const rand = seeded(20260905)
  const list: Order[] = []
  for (let i = 0; i < 40; i++) {
    const customer = pick(customers, rand())
    const itemCount = 1 + Math.floor(rand() * 3)
    const items = Array.from({ length: itemCount }, () => ({
      productId: pick(products, rand()).id,
      quantity: 1 + Math.floor(rand() * 3),
    }))
    list.push({
      id: `ord_${1041 + i}`,
      customerId: customer.id,
      status: pick(statusPool, rand()),
      items,
      channel: pick(channelPool, rand()),
      createdMinutesAgo: Math.floor(rand() * DAY * 30) + 5,
    })
  }
  return list
})()

export const activity: Activity[] = [
  { id: "act_01", actor: "Olivia Bennett", action: "upgraded to", target: "Team plan", minutesAgo: 12 },
  { id: "act_02", actor: "Mason Okafor", action: "started a trial of", target: "Pro plan", minutesAgo: 48 },
  { id: "act_03", actor: "Liam Carter", action: "added", target: "2 extra seats", minutesAgo: 60 * 3 },
  { id: "act_04", actor: "System", action: "processed payout", target: "$12,480.00", minutesAgo: 60 * 5 },
  { id: "act_05", actor: "Sophia Rossi", action: "cancelled", target: "Pro subscription", minutesAgo: 60 * 9 },
  { id: "act_06", actor: "Henry Olsen", action: "purchased", target: "Onboarding Session", minutesAgo: 60 * 14 },
  { id: "act_07", actor: "Ava Nguyen", action: "invited", target: "3 teammates", minutesAgo: 60 * 26 },
  { id: "act_08", actor: "Charlotte Dubois", action: "renewed", target: "Team plan", minutesAgo: 60 * 30 },
  { id: "act_09", actor: "System", action: "flagged failed payment for", target: "Harbor", minutesAgo: 60 * 41 },
  { id: "act_10", actor: "Emily Zhang", action: "started a trial of", target: "Starter plan", minutesAgo: 60 * 52 },
]

export const monthly: MonthlyMetric[] = [
  { month: "Oct", revenue: 61200, target: 60000, orders: 412, signups: 138, web: 36000, mobile: 15200, partner: 10000 },
  { month: "Nov", revenue: 64800, target: 62000, orders: 437, signups: 152, web: 37900, mobile: 16400, partner: 10500 },
  { month: "Dec", revenue: 72400, target: 65000, orders: 489, signups: 171, web: 41000, mobile: 19400, partner: 12000 },
  { month: "Jan", revenue: 58900, target: 66000, orders: 398, signups: 129, web: 34500, mobile: 14900, partner: 9500 },
  { month: "Feb", revenue: 63300, target: 67000, orders: 421, signups: 144, web: 36800, mobile: 16000, partner: 10500 },
  { month: "Mar", revenue: 69800, target: 68000, orders: 466, signups: 163, web: 40200, mobile: 18100, partner: 11500 },
  { month: "Apr", revenue: 74100, target: 70000, orders: 495, signups: 177, web: 42600, mobile: 19500, partner: 12000 },
  { month: "May", revenue: 77600, target: 72000, orders: 518, signups: 189, web: 44300, mobile: 20800, partner: 12500 },
  { month: "Jun", revenue: 81200, target: 74000, orders: 541, signups: 196, web: 46100, mobile: 22100, partner: 13000 },
  { month: "Jul", revenue: 79400, target: 76000, orders: 529, signups: 184, web: 45000, mobile: 21400, partner: 13000 },
  { month: "Aug", revenue: 86900, target: 78000, orders: 574, signups: 211, web: 49200, mobile: 24200, partner: 13500 },
  { month: "Sep", revenue: 91300, target: 80000, orders: 602, signups: 226, web: 51600, mobile: 25700, partner: 14000 },
]

export const team: TeamMember[] = [
  { id: "usr_01", name: "Jane Doe", email: "jane@acme.com", role: "Owner", initials: "JD" },
  { id: "usr_02", name: "Marcus Lee", email: "marcus@acme.com", role: "Admin", initials: "ML" },
  { id: "usr_03", name: "Priya Raman", email: "priya@acme.com", role: "Member", initials: "PR" },
  { id: "usr_04", name: "Tom Becker", email: "tom@acme.com", role: "Member", initials: "TB" },
]

export const invoices: Invoice[] = [
  { id: "INV-2026-009", date: "Sep 1, 2026", amount: 249, status: "due" },
  { id: "INV-2026-008", date: "Aug 1, 2026", amount: 249, status: "paid" },
  { id: "INV-2026-007", date: "Jul 1, 2026", amount: 249, status: "paid" },
  { id: "INV-2026-006", date: "Jun 1, 2026", amount: 199, status: "paid" },
]
