import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/dashboard/format"
import type { Invoice } from "@/lib/dashboard/types"

export function SettingsBilling({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>You are on the Team plan, billed monthly.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">{formatCurrency(249)}</span>
            <span className="text-muted-foreground">/ month</span>
          </div>
          <p className="text-muted-foreground">
            Includes 10 seats, priority support and 1TB storage.
          </p>
          <p className="text-muted-foreground">Payment method: Visa ending in 4242.</p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline">Change plan</Button>
          <Button variant="ghost">Update payment method</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Your billing history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === "due" ? "secondary" : "outline"} className="capitalize">
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(inv.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
