"use client"

import * as React from "react"
import { Composer } from "@/components/blocks/composer"

export function ComposerDemo() {
  const [sent, setSent] = React.useState<string[]>([])
  return (
    <div className="space-y-3">
      <Composer onSend={(t) => setSent((s) => [...s, t])} />
      {sent.length ? (
        <ul className="text-sm text-muted-foreground">
          {sent.map((s, i) => (
            <li key={i}>Sent: {s}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
