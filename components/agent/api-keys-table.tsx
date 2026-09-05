"use client"

import * as React from "react"
import { Check, Copy, KeyRound, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/blocks/empty-state"
import { formatRelative } from "@/lib/agent/queries"
import type { ApiKeyRow } from "@/lib/agent/types"

const SCOPES = ["runs:read", "runs:write", "agents:read", "agents:write", "keys:read"]
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

export function ApiKeysTable({ keys: initial }: { keys: ApiKeyRow[] }) {
  const [keys, setKeys] = React.useState(initial)
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [scopes, setScopes] = React.useState<string[]>(["runs:write"])
  const [created, setCreated] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [revoking, setRevoking] = React.useState<ApiKeyRow | null>(null)
  const seq = React.useRef(0)

  const create = () => {
    const n = ++seq.current
    const secret = `ak_live_${n}f0${"x".repeat(28)}`
    setKeys((k) => [{ id: `key_local_${n}`, name: name.trim(), prefix: secret.slice(0, 12), scopes, createdAt: new Date() }, ...k])
    setCreated(secret)
    setName("")
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Keys authenticate API calls to run agents. Secrets are shown once.</p>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) {
              setCreated(null)
              setCopied(false)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <KeyRound className="size-4" /> Create key
            </Button>
          </DialogTrigger>
          <DialogContent>
            {created ? (
              <>
                <DialogHeader>
                  <DialogTitle>Key created</DialogTitle>
                  <DialogDescription>Copy it now. You will not be able to see it again.</DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2 font-mono text-xs">
                  <code className="flex-1 truncate">{created}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Copy key"
                    onClick={async () => {
                      await navigator.clipboard.writeText(created)
                      setCopied(true)
                    }}
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={() => setOpen(false)}>Done</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Create API key</DialogTitle>
                  <DialogDescription>Give it a name you will recognise and choose what it can do.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="key-name">Name</Label>
                    <Input id="key-name" placeholder="e.g. Production backend" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Scopes</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {SCOPES.map((s) => (
                        <label key={s} className="flex items-center gap-2 text-sm">
                          <Checkbox checked={scopes.includes(s)} onCheckedChange={(v) => setScopes((l) => (v ? [...l, s] : l.filter((x) => x !== s)))} aria-label={s} />
                          <code className="text-xs">{s}</code>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button disabled={name.trim() === "" || scopes.length === 0} onClick={create}>
                    Create
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {keys.length === 0 ? (
        <EmptyState icon={KeyRound} title="No API keys" description="Create a key to call the API." />
      ) : (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell className="font-mono text-xs">{k.prefix}…</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <Badge key={s} variant="outline" className="font-mono text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{dateFmt.format(k.createdAt)}</TableCell>
                  <TableCell className="text-muted-foreground" suppressHydrationWarning>
                    {k.lastUsedAt ? formatRelative(k.lastUsedAt) : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" aria-label={`Revoke ${k.name}`} onClick={() => setRevoking(k)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={revoking !== null} onOpenChange={(o) => !o && setRevoking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke {revoking?.name}?</DialogTitle>
            <DialogDescription>Anything using this key will stop working immediately. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevoking(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setKeys((l) => l.filter((x) => x.id !== revoking?.id))
                setRevoking(null)
              }}
            >
              Revoke key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
