import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/blocks/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ThemeSettingsLoader } from "@/components/blocks/theme-customizer"
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { default: "Kit", template: "%s · Kit" },
  description: "Application templates and blocks for shadcn/ui, installable with the shadcn CLI.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased font-sans")}
    >
      <body>
        <ThemeProvider>
          <ThemeSettingsLoader />
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
