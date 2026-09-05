"use client"

import * as React from "react"
import { Check, Code2, Copy, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** Preview/code switcher for a block demo. `code` is the demo's source, read on the server. */
export function CodeToggle({ code, filename, children }: { code: string; filename: string; children: React.ReactNode }) {
  const [view, setView] = React.useState<"preview" | "code">("preview")
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={(v) => v && setView(v as "preview" | "code")} aria-label="View">
          <ToggleGroupItem value="preview" aria-label="Preview">
            <Eye className="size-4" /> Preview
          </ToggleGroupItem>
          <ToggleGroupItem value="code" aria-label="Code">
            <Code2 className="size-4" /> Code
          </ToggleGroupItem>
        </ToggleGroup>
        {view === "code" ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={async () => {
              await navigator.clipboard.writeText(code)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />} Copy
          </Button>
        ) : null}
      </div>
      {view === "preview" ? (
        <div className="min-w-0 rounded-lg border p-6">{children}</div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/50 px-3 py-1.5 font-mono text-xs text-muted-foreground">{filename}</div>
          <pre className="max-h-[520px] overflow-auto p-4 font-mono text-xs leading-relaxed" tabIndex={0}>
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
