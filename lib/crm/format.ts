const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
const compact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})
const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

export function formatCurrency(n: number): string {
  return currency.format(n)
}

export function formatCompactCurrency(n: number): string {
  return compact.format(n)
}

export function formatDate(d: Date): string {
  return date.format(d)
}

export function formatShortDate(d: Date): string {
  return shortDate.format(d)
}

export function formatRelative(d: Date, now: Date = new Date()): string {
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000)
  const abs = Math.abs(diff)
  const unit =
    abs < 1 ? "just now" : abs < 60 ? `${abs}m` : abs < 1440 ? `${Math.floor(abs / 60)}h` : `${Math.floor(abs / 1440)}d`
  if (unit === "just now") return unit
  return diff >= 0 ? `${unit} ago` : `in ${unit}`
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => (p[0] ?? "").toUpperCase())
    .join("")
}
