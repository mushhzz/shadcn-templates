export type CustomerStatus = "active" | "churned" | "trial"
export type OrderStatus = "paid" | "pending" | "refunded" | "failed"
export type Channel = "web" | "mobile" | "partner"
export type Plan = "Free" | "Pro" | "Team"

export type Customer = {
  id: string
  name: string
  email: string
  company: string
  status: CustomerStatus
  plan: Plan
  lifetimeValue: number
  /** Minutes before "now"; materialised to a Date by queries. */
  createdMinutesAgo: number
}

export type Product = { id: string; name: string; price: number; category: string }
export type OrderItem = { productId: string; quantity: number }

export type Order = {
  id: string
  customerId: string
  status: OrderStatus
  items: OrderItem[]
  channel: Channel
  createdMinutesAgo: number
}

export type Activity = {
  id: string
  actor: string
  action: string
  target: string
  minutesAgo: number
}

export type MonthlyMetric = {
  month: string
  revenue: number
  target: number
  orders: number
  signups: number
  web: number
  mobile: number
  partner: number
}

export type TeamMember = {
  id: string
  name: string
  email: string
  role: "Owner" | "Admin" | "Member"
  initials: string
}

export type Invoice = { id: string; date: string; amount: number; status: "paid" | "due" }

export type OrderRow = Omit<Order, "createdMinutesAgo"> & {
  createdAt: Date
  customerName: string
  total: number
  itemCount: number
}

export type CustomerRow = Omit<Customer, "createdMinutesAgo"> & {
  createdAt: Date
  initials: string
  orderCount: number
}
