export type DealStage = "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost"
export type ContactStatus = "lead" | "customer" | "churned"
export type TaskPriority = "low" | "medium" | "high"
export type ActivityType = "note" | "call" | "email" | "meeting"

export type Company = {
  id: string
  name: string
  domain: string
  industry: string
  size: string
  location: string
}

export type Contact = {
  id: string
  name: string
  email: string
  phone: string
  title: string
  companyId: string
  owner: string
  status: ContactStatus
  createdMinutesAgo: number
}

export type Deal = {
  id: string
  title: string
  companyId: string
  contactId: string
  value: number
  stage: DealStage
  owner: string
  /** Positive = in the future. */
  closeInMinutes: number
  createdMinutesAgo: number
}

export type Task = {
  id: string
  title: string
  /** Positive = in the future, negative = overdue. */
  dueInMinutes: number
  done: boolean
  priority: TaskPriority
  owner: string
  contactId?: string
  dealId?: string
}

export type ActivityEvent = {
  id: string
  type: ActivityType
  actor: string
  body: string
  minutesAgo: number
  contactId?: string
  dealId?: string
}

export type ContactRow = Omit<Contact, "createdMinutesAgo"> & {
  createdAt: Date
  initials: string
  companyName: string
  openDeals: number
}

export type CompanyRow = Company & {
  contactCount: number
  openDealValue: number
  initials: string
}

export type DealRow = Omit<Deal, "closeInMinutes" | "createdMinutesAgo"> & {
  closeDate: Date
  createdAt: Date
  companyName: string
  contactName: string
}

export type TaskRow = Omit<Task, "dueInMinutes"> & {
  dueAt: Date
  contactName?: string
  dealTitle?: string
}

export type TimelineItem = ActivityEvent & { at: Date }
