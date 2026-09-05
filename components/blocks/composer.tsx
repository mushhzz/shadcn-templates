"use client"

import * as React from "react"
import { Loader2, Paperclip, SendHorizonal, Smile, Square, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type ComposerStatus = "idle" | "submitted" | "streaming" | "error"

export type ComposerAttachment = { id: string; name: string; size?: number }

export type ComposerProps = {
  onSend: (text: string) => void
  /** Drives the submit button: a spinner while submitted, a stop button while streaming. */
  status?: ComposerStatus
  onStop?: () => void
  placeholder?: string
  disabled?: boolean
  /** Controlled value; omit for internal state. */
  value?: string
  onValueChange?: (value: string) => void
  /** Overrides the default attach/emoji buttons. */
  leftSlot?: React.ReactNode
  /** Rendered between the textarea and the submit button (e.g. a model picker). */
  rightSlot?: React.ReactNode
  /** Rendered above the textarea (e.g. attachments, quoted reply). */
  header?: React.ReactNode
  attachments?: ComposerAttachment[]
  onRemoveAttachment?: (id: string) => void
  onAttach?: () => void
  /** Enter sends and Shift+Enter inserts a newline (default). Set false to require the button. */
  submitOnEnter?: boolean
  maxRows?: number
  className?: string
}

export function Composer({
  onSend,
  status = "idle",
  onStop,
  placeholder = "Write a message…",
  disabled,
  value: controlledValue,
  onValueChange,
  leftSlot,
  rightSlot,
  header,
  attachments,
  onRemoveAttachment,
  onAttach,
  submitOnEnter = true,
  maxRows = 8,
  className,
}: ComposerProps) {
  const [internal, setInternal] = React.useState("")
  const value = controlledValue ?? internal
  const setValue = (v: string) => {
    onValueChange?.(v)
    if (controlledValue === undefined) setInternal(v)
  }
  const ref = React.useRef<HTMLTextAreaElement>(null)
  const busy = status === "submitted" || status === "streaming"
  const canSend = value.trim().length > 0 && !disabled && !busy

  // Auto-resize up to maxRows.
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    const line = parseFloat(getComputedStyle(el).lineHeight) || 20
    const max = line * maxRows + 16
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden"
  }, [value, maxRows])

  const submit = () => {
    const text = value.trim()
    if (!text || disabled || busy) return
    onSend(text)
    setValue("")
  }

  return (
    <div data-slot="composer" data-status={status} className={cn("border-t", className)}>
      {header || (attachments && attachments.length > 0) ? (
        <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
          {header}
          {attachments?.map((a) => (
            <Badge key={a.id} variant="secondary" className="gap-1 pr-1">
              <Paperclip className="size-3" />
              <span className="max-w-40 truncate">{a.name}</span>
              {onRemoveAttachment ? (
                <button
                  type="button"
                  aria-label={`Remove ${a.name}`}
                  className="rounded-full p-0.5 hover:bg-foreground/10"
                  onClick={() => onRemoveAttachment(a.id)}
                >
                  <X className="size-3" />
                </button>
              ) : null}
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-2 p-3">
        <div className="flex items-center gap-1">
          {leftSlot ?? (
            <>
              <Button variant="ghost" size="icon" aria-label="Attach file" disabled={disabled} onClick={onAttach}>
                <Paperclip className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Insert emoji" disabled={disabled}>
                <Smile className="size-4" />
              </Button>
            </>
          )}
        </div>
        <Textarea
          ref={ref}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label={placeholder}
          className="max-h-60 min-h-9 flex-1 resize-none"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (submitOnEnter && e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              submit()
            }
          }}
        />
        {rightSlot}
        {status === "streaming" && onStop ? (
          <Button size="icon" variant="outline" aria-label="Stop" onClick={onStop}>
            <Square className="size-3.5 fill-current" />
          </Button>
        ) : (
          <Button size="icon" aria-label="Send" disabled={!canSend} onClick={submit}>
            {status === "submitted" ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
          </Button>
        )}
      </div>
      {status === "error" ? (
        <p role="alert" className="px-3 pb-2 text-xs text-destructive">
          Something went wrong. Try again.
        </p>
      ) : null}
    </div>
  )
}
