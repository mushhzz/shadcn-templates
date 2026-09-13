"use client"

import Link from "next/link"
import { Shield, Zap } from "lucide-react"
import { toast } from "sonner"
import { AuthLayout } from "@/components/blocks/auth-layout"
import { ForgotPasswordForm, LoginForm, SignupForm } from "@/components/blocks/auth-forms"
import { KIT_ART } from "@/lib/kit/assets"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const brand = { name: "Acme", href: "/" }
const quote = {
  text: "We replaced three internal tools with one dashboard in a week. The templates did most of the work.",
  author: "Priya Raman, Engineering Manager at Acme",
}
const footer = (
  <>
    By continuing you agree to our{" "}
    <Link href="#" className="underline underline-offset-4">
      Terms
    </Link>{" "}
    and{" "}
    <Link href="#" className="underline underline-offset-4">
      Privacy Policy
    </Link>
    .
  </>
)

function Aside() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-2 font-heading text-lg font-semibold">
        <Zap className="size-5" /> Acme
      </div>
      <ul className="grid gap-3 text-sm text-brand-foreground/75">
        <li className="flex items-start gap-2">
          <Shield className="mt-0.5 size-4 shrink-0" /> SSO, SCIM and audit logs on every plan.
        </li>
        <li className="flex items-start gap-2">
          <Zap className="mt-0.5 size-4 shrink-0" /> Set up in minutes with typed mock data you can swap for your API.
        </li>
      </ul>
    </div>
  )
}

export function LoginPage() {
  return (
    <AuthLayout brand={brand} aside={<Aside />} quote={quote} footer={footer} art={KIT_ART.authPanel}>
      <LoginForm
        onSubmit={async ({ email }) => {
          await wait(900)
          if (email.endsWith("@fail.test")) throw new Error("Incorrect email or password.")
          toast.success(`Signed in as ${email} (mock)`)
        }}
        onGoogle={() => toast("Google sign-in is mocked")}
        onGithub={() => toast("GitHub sign-in is mocked")}
      />
    </AuthLayout>
  )
}

export function SignupPage() {
  return (
    <AuthLayout brand={brand} aside={<Aside />} quote={quote} footer={footer} art={KIT_ART.authPanel}>
      <SignupForm
        onSubmit={async ({ email }) => {
          await wait(900)
          toast.success(`Account created for ${email} (mock)`)
        }}
        onGoogle={() => toast("Google sign-up is mocked")}
        onGithub={() => toast("GitHub sign-up is mocked")}
      />
    </AuthLayout>
  )
}

export function ForgotPasswordPage() {
  return (
    <AuthLayout brand={brand} aside={<Aside />} quote={quote} art={KIT_ART.authPanel}>
      <ForgotPasswordForm
        onSubmit={async () => {
          await wait(700)
        }}
      />
    </AuthLayout>
  )
}
