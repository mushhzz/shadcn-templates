"use client"

import { CreditCard, DollarSign, Users } from "lucide-react"
import { StatCard } from "@/components/blocks/stat-card"

export function StatCardDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Revenue" value="$48,210" icon={<DollarSign />} delta={12.4} deltaLabel="vs last month" sparkline={[4, 6, 5, 8, 9, 12, 11]} />
      <StatCard label="Active users" value="2,318" icon={<Users />} delta={-3.1} deltaLabel="vs last month" sparkline={[9, 8, 8, 7, 7, 6, 6]} sparklineType="bar" />
      <StatCard label="Churn" value="1.8%" delta={0} deltaLabel="unchanged" />
      <StatCard label="Subscriptions" value="+4,850" icon={<CreditCard />} delta={180.1} deltaLabel="vs last month" sparkline={[240, 300, 200, 278, 189, 239, 278, 189]} sparklineType="bar" layout="stacked" />
    </div>
  )
}
