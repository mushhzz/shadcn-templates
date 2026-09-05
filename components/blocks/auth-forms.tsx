"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------------------------------
 * Shared bits
 * -----------------------------------------------------------------------------------------------*/

export type AuthStatus = "idle" | "submitting" | "error" | "success"

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  )
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6.1-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.3 2.8.1 3.2.8.8 1.3 1.9 1.3 3.1 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  )
}

export function SocialButtons({ onGoogle, onGithub, disabled }: { onGoogle?: () => void; onGithub?: () => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" onClick={onGoogle} disabled={disabled}>
        <GoogleIcon className="size-4" /> Google
      </Button>
      <Button type="button" variant="outline" onClick={onGithub} disabled={disabled}>
        <GithubIcon className="size-4" /> GitHub
      </Button>
    </div>
  )
}

export function OrDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
      <span className="relative z-10 bg-background px-2 text-muted-foreground">{label}</span>
    </div>
  )
}

export function PasswordInput({ id, className, ...props }: React.ComponentProps<typeof Input>) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
        onClick={() => setShow((s) => !s)}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  )
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* -------------------------------------------------------------------------------------------------
 * Login
 * -----------------------------------------------------------------------------------------------*/

export type LoginFormProps = {
  onSubmit: (values: { email: string; password: string; remember: boolean }) => Promise<void> | void
  onGoogle?: () => void
  onGithub?: () => void
  signupHref?: string
  forgotHref?: string
  className?: string
}

export function LoginForm({ onSubmit, onGoogle, onGithub, signupHref = "/signup", forgotHref = "/forgot-password", className }: LoginFormProps) {
  const [status, setStatus] = React.useState<AuthStatus>("idle")
  const [error, setError] = React.useState<string>()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [remember, setRemember] = React.useState(true)
  const busy = status === "submitting"

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL.test(email)) return setError("Enter a valid email address.")
    if (password.length < 8) return setError("Password must be at least 8 characters.")
    setError(undefined)
    setStatus("submitting")
    try {
      await onSubmit({ email, password, remember })
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Sign in failed. Try again.")
    }
  }

  return (
    <form onSubmit={submit} noValidate className={cn("grid gap-6", className)} aria-busy={busy}>
      <div className="grid gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account to continue.</p>
      </div>
      <SocialButtons onGoogle={onGoogle} onGithub={onGithub} disabled={busy} />
      <OrDivider />
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link href={forgotHref} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="login-password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} /> Remember me for 30 days
        </label>
        <FormError message={error} />
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href={signupHref} className="text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </form>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Signup
 * -----------------------------------------------------------------------------------------------*/

export type SignupFormProps = {
  onSubmit: (values: { name: string; email: string; password: string }) => Promise<void> | void
  onGoogle?: () => void
  onGithub?: () => void
  loginHref?: string
  termsHref?: string
  privacyHref?: string
  className?: string
}

function strength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"] as const
  return { score: s as 0 | 1 | 2 | 3 | 4, label: labels[s] }
}

export function SignupForm({ onSubmit, onGoogle, onGithub, loginHref = "/login", termsHref = "#", privacyHref = "#", className }: SignupFormProps) {
  const [status, setStatus] = React.useState<AuthStatus>("idle")
  const [error, setError] = React.useState<string>()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [agree, setAgree] = React.useState(false)
  const busy = status === "submitting"
  const pw = strength(password)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setError("Enter your name.")
    if (!EMAIL.test(email)) return setError("Enter a valid email address.")
    if (pw.score < 2) return setError("Choose a stronger password: 8+ characters with a number.")
    if (!agree) return setError("You need to accept the terms to continue.")
    setError(undefined)
    setStatus("submitting")
    try {
      await onSubmit({ name: name.trim(), email, password })
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Sign up failed. Try again.")
    }
  }

  return (
    <form onSubmit={submit} noValidate className={cn("grid gap-6", className)} aria-busy={busy}>
      <div className="grid gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start your 14-day free trial. No card required.</p>
      </div>
      <SocialButtons onGoogle={onGoogle} onGithub={onGithub} disabled={busy} />
      <OrDivider />
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="signup-name">Full name</Label>
          <Input id="signup-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="signup-email">Work email</Label>
          <Input id="signup-email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="signup-password">Password</Label>
          <PasswordInput id="signup-password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-describedby="signup-password-strength" />
          <div id="signup-password-strength" className="grid gap-1" aria-live="polite">
            <div className="grid grid-cols-4 gap-1" aria-hidden>
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 rounded-full bg-muted transition-colors",
                    password && i <= pw.score && (pw.score <= 1 ? "bg-destructive" : pw.score === 2 ? "bg-warning" : "bg-success"),
                  )}
                />
              ))}
            </div>
            {password ? <span className="text-xs text-muted-foreground">{pw.label}</span> : null}
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox className="mt-0.5" checked={agree} onCheckedChange={(v) => setAgree(!!v)} />
          <span className="text-muted-foreground">
            I agree to the{" "}
            <Link href={termsHref} className="text-foreground underline underline-offset-4">
              Terms
            </Link>{" "}
            and{" "}
            <Link href={privacyHref} className="text-foreground underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <FormError message={error} />
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={loginHref} className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Forgot password
 * -----------------------------------------------------------------------------------------------*/

export type ForgotPasswordFormProps = {
  onSubmit: (values: { email: string }) => Promise<void> | void
  loginHref?: string
  className?: string
}

export function ForgotPasswordForm({ onSubmit, loginHref = "/login", className }: ForgotPasswordFormProps) {
  const [status, setStatus] = React.useState<AuthStatus>("idle")
  const [error, setError] = React.useState<string>()
  const [email, setEmail] = React.useState("")
  const busy = status === "submitting"

  if (status === "success") {
    return (
      <div className={cn("grid gap-4 text-center", className)} role="status">
        <h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="text-sm text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{email}</span>, we sent a link to reset your password. It expires in 15 minutes.
        </p>
        <Button variant="outline" asChild>
          <Link href={loginHref}>Back to sign in</Link>
        </Button>
      </div>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL.test(email)) return setError("Enter a valid email address.")
    setError(undefined)
    setStatus("submitting")
    try {
      await onSubmit({ email })
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.")
    }
  }

  return (
    <form onSubmit={submit} noValidate className={cn("grid gap-6", className)} aria-busy={busy}>
      <div className="grid gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input id="forgot-email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <FormError message={error} />
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          {busy ? "Sending…" : "Send reset link"}
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href={loginHref} className="text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
