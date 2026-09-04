import Link from "next/link"
import { ThemeToggle } from "@/components/blocks/app-shell"
import { REGISTRY_NAMESPACE, REGISTRY_URL } from "@/lib/site"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="font-semibold">
            Kit
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/">Templates</Link>
            <Link href="/blocks">Blocks</Link>
          </nav>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          Add to <code>components.json</code>:{" "}
          <code>{`"registries": { "${REGISTRY_NAMESPACE}": "${REGISTRY_URL}" }`}</code>
        </div>
      </footer>
    </div>
  )
}
