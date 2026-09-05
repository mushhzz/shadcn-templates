import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/dashboard/format"
import type { getTopProducts } from "@/lib/dashboard/queries"

export function TopProducts({ items }: { items: ReturnType<typeof getTopProducts> }) {
  const max = items[0]?.revenue ?? 1
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top products</CardTitle>
        <CardDescription>By paid revenue in the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map(({ product, units, revenue }) => (
          <div key={product.id} className="grid gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{product.name}</span>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <span className="tabular-nums">{formatCurrency(revenue)}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary"
                style={{ width: `${Math.max(4, (revenue / max) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">{formatNumber(units)} units</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
