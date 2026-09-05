import type { Metadata } from "next"
import { SignupPage } from "@/components/auth/auth-pages"

export const metadata: Metadata = { title: "Create account" }

export default function Page() {
  return <SignupPage />
}
