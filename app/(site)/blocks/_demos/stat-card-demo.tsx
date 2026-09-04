import { StatCard } from "@/components/blocks/stat-card"

export function StatCardDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Revenue"
        value="$48,210"
        delta={12.4}
        deltaLabel="vs last month"
        sparkline={[4, 6, 5, 8, 9, 12, 11]}
      />
      <StatCard
        label="Active users"
        value="2,318"
        delta={-3.1}
        deltaLabel="vs last month"
        sparkline={[9, 8, 8, 7, 7, 6, 6]}
      />
      <StatCard label="Churn" value="1.8%" delta={0} />
    </div>
  )
}
