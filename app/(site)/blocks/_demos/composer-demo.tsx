"use client"

import * as React from "react"
import { Composer, type ComposerAttachment, type ComposerStatus } from "@/components/blocks/composer"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function ComposerDemo() {
  const [sent, setSent] = React.useState<string[]>([])
  const [status, setStatus] = React.useState<ComposerStatus>("idle")
  const [attachments, setAttachments] = React.useState<ComposerAttachment[]>([{ id: "1", name: "brief.pdf" }])
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Status</span>
        <ToggleGroup type="single" variant="outline" size="sm" value={status} onValueChange={(v) => v && setStatus(v as ComposerStatus)} aria-label="Composer status">
          {(["idle", "submitted", "streaming", "error"] as const).map((s) => (
            <ToggleGroupItem key={s} value={s} className="capitalize">
              {s}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="rounded-lg border">
        <Composer
          status={status}
          onStop={() => setStatus("idle")}
          onSend={(t) => setSent((s) => [...s, t])}
          attachments={attachments}
          onRemoveAttachment={(id) => setAttachments((a) => a.filter((x) => x.id !== id))}
          onAttach={() => setAttachments((a) => [...a, { id: String(Date.now()), name: `file-${a.length + 1}.png` }])}
          className="border-t-0"
        />
      </div>
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
