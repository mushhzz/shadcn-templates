import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type AuthLayoutProps = {
  brand: { name: string; href: string; icon?: React.ReactNode }
  /** Content for the decorative side panel; hidden below `lg`. */
  aside?: React.ReactNode
  /** Quote or testimonial rendered at the bottom of the side panel. */
  quote?: { text: string; author: string }
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** Two-column auth shell: form on the left, brand panel on the right. */
export function AuthLayout({ brand, aside, quote, footer, className, children }: AuthLayoutProps) {
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
      <aside aria-hidden className="relative hidden overflow-hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_color-mix(in_oklch,var(--primary)_18%,transparent),transparent_60%),radial-gradient(ellipse_at_bottom_right,_color-mix(in_oklch,var(--primary)_10%,transparent),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_6%,transparent)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <div>{aside}</div>
          {quote ? (
            <blockquote className="grid gap-2">
              <p className="text-lg leading-relaxed">“{quote.text}”</p>
              <footer className="text-sm text-muted-foreground">{quote.author}</footer>
            </blockquote>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
