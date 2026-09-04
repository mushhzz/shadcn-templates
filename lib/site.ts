export const REGISTRY_NAMESPACE = "@kit"
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shadcn-templates.vercel.app"
export const REGISTRY_URL = `${SITE_URL}/r/{name}.json`

export function installCommand(itemName: string) {
  return `npx shadcn@latest add ${REGISTRY_NAMESPACE}/${itemName}`
}
