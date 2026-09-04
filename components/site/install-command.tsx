"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { installCommand } from "@/lib/site"

export function InstallCommand({ item }: { item: string }) {
  const [copied, setCopied] = React.useState(false)
  const cmd = installCommand(item)
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs">
      <code className="flex-1 truncate">{cmd}</code>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        aria-label="Copy install command"
        onClick={async () => {
          await navigator.clipboard.writeText(cmd)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  )
}
