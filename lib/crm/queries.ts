import { activity, companies, contacts, deals, owners, tasks } from "./fixtures"
import { initialsOf } from "./format"
import type {
  CompanyRow,
  ContactRow,
  DealRow,
  DealStage,
  TaskRow,
  TimelineItem,
} from "./types"

export const STAGES: { id: DealStage; title: string }[] = [
  { id: "lead", title: "Lead" },
  { id: "qualified", title: "Qualified" },
  { id: "proposal", title: "Proposal" },
  { id: "negotiation", title: "Negotiation" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
]

const OPEN_STAGES: DealStage[] = ["lead", "qualified", "proposal", "negotiation"]

const companyById = new Map(companies.map((c) => [c.id, c]))
const contactById = new Map(contacts.map((c) => [c.id, c]))
const dealById = new Map(deals.map((d) => [d.id, d]))

function shift(now: Date, minutes: number): Date {
  return new Date(now.getTime() + minutes * 60000)
}

export function getOwners(): string[] {
  return owners
}

export function getDeals(now: Date = new Date()): DealRow[] {
  return deals
    .map<DealRow>(({ closeInMinutes, createdMinutesAgo, ...d }) => ({
      ...d,
      closeDate: shift(now, closeInMinutes),
      createdAt: shift(now, -createdMinutesAgo),
      companyName: companyById.get(d.companyId)?.name ?? "Unknown",
      contactName: contactById.get(d.contactId)?.name ?? "Unknown",
    }))
    .sort((a, b) => b.value - a.value)
}

export function getDealById(id: string, now: Date = new Date()): DealRow | undefined {
  return getDeals(now).find((d) => d.id === id)
}

export function getPipelineStats() {
  const open = deals.filter((d) => OPEN_STAGES.includes(d.stage))
  const won = deals.filter((d) => d.stage === "won")
  const lost = deals.filter((d) => d.stage === "lost")
  const closed = won.length + lost.length
  return {
    openValue: open.reduce((s, d) => s + d.value, 0),
    openCount: open.length,
    wonValue: won.reduce((s, d) => s + d.value, 0),
    wonCount: won.length,
    winRate: closed === 0 ? 0 : (won.length / closed) * 100,
    avgDeal: open.length === 0 ? 0 : open.reduce((s, d) => s + d.value, 0) / open.length,
    newLeads: contacts.filter((c) => c.status === "lead").length,
  }
}

export function getDealsByStage(): { stage: string; count: number; value: number }[] {
  return STAGES.map((s) => {
    const list = deals.filter((d) => d.stage === s.id)
    return { stage: s.title, count: list.length, value: list.reduce((sum, d) => sum + d.value, 0) }
  })
}

export function getContacts(now: Date = new Date()): ContactRow[] {
  return contacts
    .map<ContactRow>(({ createdMinutesAgo, ...c }) => ({
      ...c,
      createdAt: shift(now, -createdMinutesAgo),
      initials: initialsOf(c.name),
      companyName: companyById.get(c.companyId)?.name ?? "Unknown",
      openDeals: deals.filter((d) => d.contactId === c.id && OPEN_STAGES.includes(d.stage)).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getContactById(id: string, now: Date = new Date()): ContactRow | undefined {
  return getContacts(now).find((c) => c.id === id)
}

export function getCompanies(): CompanyRow[] {
  return companies
    .map<CompanyRow>((c) => ({
      ...c,
      initials: initialsOf(c.name),
      contactCount: contacts.filter((ct) => ct.companyId === c.id).length,
      openDealValue: deals
        .filter((d) => d.companyId === c.id && OPEN_STAGES.includes(d.stage))
        .reduce((s, d) => s + d.value, 0),
    }))
    .sort((a, b) => b.openDealValue - a.openDealValue)
}

export function getCompanyById(id: string): CompanyRow | undefined {
  return getCompanies().find((c) => c.id === id)
}

export function getContactsForCompany(companyId: string, now: Date = new Date()): ContactRow[] {
  return getContacts(now).filter((c) => c.companyId === companyId)
}

export function getDealsForCompany(companyId: string, now: Date = new Date()): DealRow[] {
  return getDeals(now).filter((d) => d.companyId === companyId)
}

export function getDealsForContact(contactId: string, now: Date = new Date()): DealRow[] {
  return getDeals(now).filter((d) => d.contactId === contactId)
}

export function getTimeline(
  filter: { contactId?: string; dealId?: string; companyId?: string } = {},
  now: Date = new Date(),
): TimelineItem[] {
  return activity
    .filter((e) => {
      if (filter.contactId && e.contactId !== filter.contactId) return false
      if (filter.dealId && e.dealId !== filter.dealId) return false
      if (filter.companyId) {
        const viaContact = e.contactId ? contactById.get(e.contactId)?.companyId : undefined
        const viaDeal = e.dealId ? dealById.get(e.dealId)?.companyId : undefined
        if (viaContact !== filter.companyId && viaDeal !== filter.companyId) return false
      }
      return true
    })
    .map((e) => ({ ...e, at: shift(now, -e.minutesAgo) }))
    .sort((a, b) => b.at.getTime() - a.at.getTime())
}

export function getTasks(now: Date = new Date()): TaskRow[] {
  return tasks
    .map<TaskRow>(({ dueInMinutes, ...t }) => ({
      ...t,
      dueAt: shift(now, dueInMinutes),
      contactName: t.contactId ? contactById.get(t.contactId)?.name : undefined,
      dealTitle: t.dealId ? dealById.get(t.dealId)?.title : undefined,
    }))
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
}

export type TaskBucket = "Overdue" | "Today" | "This week" | "Later" | "Done"

export function bucketTask(task: TaskRow, now: Date = new Date()): TaskBucket {
  if (task.done) return "Done"
  const diff = task.dueAt.getTime() - now.getTime()
  const day = 86400000
  if (diff < 0) return "Overdue"
  if (diff < day) return "Today"
  if (diff < 7 * day) return "This week"
  return "Later"
}

export function getTasksGrouped(now: Date = new Date()): { bucket: TaskBucket; tasks: TaskRow[] }[] {
  const order: TaskBucket[] = ["Overdue", "Today", "This week", "Later", "Done"]
  const all = getTasks(now)
  return order
    .map((bucket) => ({ bucket, tasks: all.filter((t) => bucketTask(t, now) === bucket) }))
    .filter((g) => g.tasks.length > 0)
}
