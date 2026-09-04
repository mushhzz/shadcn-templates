"use client"

import * as React from "react"
import { Paperclip, SendHorizonal, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type ComposerProps = {
  onSend: (text: string) => void
  placeholder?: string
  disabled?: boolean
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  className?: string
}

export function Composer({
  onSend,
  placeholder = "Write a message…",
  disabled,
  leftSlot,
  rightSlot,
  className,
}: ComposerProps) {
  const [value, setValue] = React.useState("")
  const canSend = value.trim().length > 0 && !disabled

  const submit = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue("")
  }

  return (
    <div data-slot="composer" className={cn("flex items-end gap-2 border-t p-3", className)}>
      <div className="flex items-center gap-1">
        {leftSlot ?? (
          <>
            <Button variant="ghost" size="icon" aria-label="Attach file" disabled={disabled}>
              <Paperclip className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Insert emoji" disabled={disabled}>
              <Smile className="size-4" />
            </Button>
          </>
        )}
      </div>
      <Textarea
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="max-h-40 min-h-9 flex-1 resize-none"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
      />
      {rightSlot}
      <Button size="icon" aria-label="Send" disabled={!canSend} onClick={submit}>
        <SendHorizonal className="size-4" />
      </Button>
    </div>
  )
}
