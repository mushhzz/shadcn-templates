"use client"

import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { initialsOf } from "@/lib/dashboard/format"
import type { TeamMember } from "@/lib/dashboard/types"

type Role = TeamMember["role"]

export function SettingsTeam({ members: initial }: { members: TeamMember[] }) {
  const [members, setMembers] = React.useState(initial)
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<Role>("Member")

  const invite = () => {
    const name = email.split("@")[0]?.replace(/[._-]/g, " ") ?? "New member"
    setMembers((m) => [
      ...m,
      { id: `usr_${Date.now()}`, name, email, role, initials: initialsOf(name) },
    ])
    setEmail("")
    setOpen(false)
  }

  const setMemberRole = (id: string, next: Role) =>
    setMembers((list) => list.map((x) => (x.id === id ? { ...x, role: next } : x)))

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle>Team</CardTitle>
          <CardDescription>People with access to this workspace.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Invite member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a teammate</DialogTitle>
              <DialogDescription>They will receive an email with a link to join.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={invite} disabled={!email.includes("@")}>
                Send invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-24">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">{m.initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {m.role === "Owner" ? (
                    <span className="text-sm">Owner</span>
                  ) : (
                    <Select value={m.role} onValueChange={(v) => setMemberRole(m.id, v as Role)}>
                      <SelectTrigger className="h-8 w-32" aria-label={`Role for ${m.name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {m.role !== "Owner" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMembers((list) => list.filter((x) => x.id !== m.id))}
                    >
                      Remove
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
