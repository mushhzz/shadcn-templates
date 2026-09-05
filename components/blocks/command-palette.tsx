"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

export type CommandPaletteItem = {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  keywords?: string[]
  onSelect: () => void
}

export type CommandPaletteGroup = { heading: string; items: CommandPaletteItem[] }

/** Binds ⌘K / Ctrl+K to toggle the palette. Returns [open, setOpen]. */
export function useCommandPalette(): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])
  return [open, setOpen]
}

export function CommandPaletteTrigger({ onClick, className, label = "Search" }: { onClick: () => void; className?: string; label?: string }) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn("hidden h-8 w-56 justify-start gap-2 text-muted-foreground md:inline-flex", className)}
        onClick={onClick}
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">{label}…</span>
        <kbd className="pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <Button variant="ghost" size="icon" className="md:hidden" aria-label={label} onClick={onClick}>
        <Search className="size-4" />
      </Button>
    </>
  )
}

export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: CommandPaletteGroup[]
  placeholder?: string
  emptyMessage?: string
}) {
  const run = (fn: () => void) => {
    onOpenChange(false)
    fn()
  }
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Command palette" description="Search pages and run actions">
      <Command>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          {groups.map((g, i) => (
            <React.Fragment key={g.heading}>
              {i > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={g.heading}>
                {g.items.map((item) => (
                  <CommandItem key={item.id} value={`${item.label} ${item.keywords?.join(" ") ?? ""}`} onSelect={() => run(item.onSelect)}>
                    {item.icon ? <item.icon className="size-4" /> : null}
                    <span>{item.label}</span>
                    {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
