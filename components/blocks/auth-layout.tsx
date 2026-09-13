import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type AuthLayoutProps = {
  brand: { name: string; href: string; icon?: React.ReactNode }
  /** Content for the decorative side panel; hidden below `lg`. */
  aside?: React.ReactNode
  /** Full-bleed artwork URL for the side panel. Replaces the dot pattern. */
  art?: string
  /** Quote or testimonial rendered at the bottom of the side panel. */
  quote?: { text: string; author: string }
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
}

const DOTS =
  "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22><circle cx=%221%22 cy=%221%22 r=%221%22 fill=%22white%22 fill-opacity=%220.14%22/></svg>')]"

/** Two-column auth shell: form on the left, brand panel on the right. */
export function AuthLayout({ brand, aside, art, quote, footer, className, children }: AuthLayoutProps) {
  return (
    <div className={cn("grid min-h-svh lg:grid-cols-2", className)}>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href={brand.href} className="flex items-center gap-2 font-medium">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground [&>svg]:size-4">
              {brand.icon ?? <span className="text-sm font-bold">{brand.name[0]}</span>}
            </span>
            {brand.name}
          </Link>
        </div>
        <main className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </main>
        {footer ? <div className="text-center text-xs text-muted-foreground md:text-left">{footer}</div> : null}
      </div>
      <aside aria-hidden className="relative hidden overflow-hidden bg-brand text-brand-foreground lg:block">
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art} alt="" className="absolute inset-0 size-full object-cover opacity-[0.18]" />
        ) : (
          <div className={cn("absolute inset-0", DOTS)} />
        )}
        <div className="relative flex h-full flex-col justify-between p-10">
          <div>{aside}</div>
          {quote ? (
            <blockquote className="grid gap-2">
              <p className="font-heading text-2xl leading-snug tracking-tight text-balance">“{quote.text}”</p>
              <footer className="text-sm text-brand-foreground/70">{quote.author}</footer>
            </blockquote>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
