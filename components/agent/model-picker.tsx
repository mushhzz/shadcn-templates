"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getModels } from "@/lib/agent/queries"
import type { ModelId } from "@/lib/agent/types"

export function ModelPicker({
  value,
  onChange,
  className,
  size = "default",
}: {
  value: ModelId
  onChange: (value: ModelId) => void
  className?: string
  size?: "sm" | "default"
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ModelId)}>
      <SelectTrigger className={className} size={size} aria-label="Model">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {getModels().map((m) => (
          <SelectItem key={m.id} value={m.id}>
            <span className="flex items-center gap-2">
              {m.name}
              <span className="text-xs text-muted-foreground">{m.note}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
