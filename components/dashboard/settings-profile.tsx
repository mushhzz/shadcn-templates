"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function SettingsProfile() {
  const [saved, setSaved] = React.useState(false)
  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        }}
      >
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear to your team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-lg">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue="Jane Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue="jane@acme.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" rows={3} defaultValue="Head of Operations at Acme." />
          </div>
        </CardContent>
        <CardFooter className="gap-3">
          <Button type="submit">Save changes</Button>
          {saved ? <span className="text-sm text-muted-foreground">Saved</span> : null}
        </CardFooter>
      </form>
    </Card>
  )
}
