"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { personAvatar } from "@/lib/kit/assets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import type { ChatUserRow, Presence } from "@/lib/chat/types"

export function ChatSettings({ user }: { user: ChatUserRow }) {
  const [presence, setPresence] = React.useState<Presence>(user.presence)
  const [saved, setSaved] = React.useState(false)
  const [prefs, setPrefs] = React.useState({ mentions: true, dms: true, groups: false, sounds: true, previews: true })

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
          }}
        >
          <CardHeader className="flex flex-row items-center gap-3">
            <Avatar className="size-12">
              <AvatarImage src={personAvatar(user.name)} alt="" />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle>Profile</CardTitle>
              <CardDescription>How you appear to others in chat.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input id="display-name" defaultValue={user.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="handle">Handle</Label>
              <Input id="handle" defaultValue={`@${user.handle}`} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" defaultValue={user.title} />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={presence} onValueChange={(v) => setPresence(v as Presence)}>
                <SelectTrigger className="w-40" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                  <SelectItem value="offline">Appear offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="gap-3">
            <Button type="submit">Save</Button>
            {saved ? <span className="text-sm text-muted-foreground">Saved</span> : null}
          </CardFooter>
        </form>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>What should get your attention.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {(
            [
              ["mentions", "Mentions", "When someone @mentions you"],
              ["dms", "Direct messages", "Every new direct message"],
              ["groups", "Group messages", "All messages in groups you are in"],
              ["sounds", "Sounds", "Play a sound for new messages"],
              ["previews", "Message previews", "Show message text in notifications"],
            ] as const
          ).map(([key, label, desc], i) => (
            <React.Fragment key={key}>
              {i > 0 ? <Separator /> : null}
              <div className="flex items-center justify-between gap-4">
                <div className="grid gap-0.5">
                  <Label htmlFor={`pref-${key}`}>{label}</Label>
                  <span className="text-sm text-muted-foreground">{desc}</span>
                </div>
                <Switch id={`pref-${key}`} checked={prefs[key]} onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))} />
              </div>
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
