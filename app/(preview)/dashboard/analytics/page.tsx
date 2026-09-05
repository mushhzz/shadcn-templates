import { PageHeader } from "@/components/blocks/page-header"
import { ChannelsChart } from "@/components/dashboard/channels-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { SignupsChart } from "@/components/dashboard/signups-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { getMonthly, getTopProducts } from "@/lib/dashboard/queries"

export default function AnalyticsPage() {
  const data = getMonthly("12m")
  return (
    <>
      <PageHeader title="Analytics" description="Trends across revenue, channels and growth." />
      <div className="grid gap-4 xl:grid-cols-2">
        <RevenueChart data={data} />
        <ChannelsChart data={data} />
        <SignupsChart data={data} />
        <TopProducts items={getTopProducts()} />
      </div>
    </>
  )
}
