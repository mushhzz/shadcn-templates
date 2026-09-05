"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

const items = [
  { id: "orders", label: "New orders", description: "Get notified when an order is placed." },
  { id: "payments", label: "Failed payments", description: "Alerts for declined or failed charges." },
  { id: "signups", label: "New signups", description: "A daily digest of new accounts." },
  { id: "product", label: "Product updates", description: "News about features and improvements." },
]

export function SettingsNotifications() {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>({
    orders: true,
    payments: true,
    signups: false,
    product: true,
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what you want to hear about by email.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((item, i) => (
          <React.Fragment key={item.id}>
            {i > 0 ? <Separator /> : null}
            <div className="flex items-center justify-between gap-4">
              <div className="grid gap-0.5">
                <Label htmlFor={`notif-${item.id}`}>{item.label}</Label>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
              <Switch
                id={`notif-${item.id}`}
                checked={enabled[item.id] ?? false}
                onCheckedChange={(v) => setEnabled((e) => ({ ...e, [item.id]: v }))}
              />
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  )
}
