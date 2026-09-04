import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

export type RegistryFile = {
  path: string
  type: string
  target?: string
}

export type RegistryItem = {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryFile[]
}

export type Registry = {
  name: string
  homepage: string
  items: RegistryItem[]
}

type Io = {
  fileExists: (path: string) => boolean
  readFile: (path: string) => string
}

const TEMPLATE_FOLDERS = ["dashboard", "chat", "crm", "agent"]
const TEMPLATE_IMPORT = new RegExp(
  `from\\s+["'](@/(?:components|lib|app)/(?:${TEMPLATE_FOLDERS.join("|")})[^"']*)["']`,
  "g",
)

/** Returns the local item name a registryDependency refers to, or null for built-in/remote names. */
function localDependencyName(dep: string): string | null {
  if (dep.startsWith("@kit/")) return dep.slice("@kit/".length)
  if (dep.startsWith("./") && dep.endsWith(".json")) return dep.slice(2, -".json".length)
  return null
}

export function checkRegistry(registry: Registry, io: Io): string[] {
  const errors: string[] = []
  const names = new Set(registry.items.map((i) => i.name))

  for (const item of registry.items) {
    for (const dep of item.registryDependencies ?? []) {
      const local = localDependencyName(dep)
      if (local !== null && !names.has(local)) {
        errors.push(`${item.name}: unresolved registryDependency ${dep}`)
      }
    }

    for (const file of item.files) {
      if (!io.fileExists(file.path)) {
        errors.push(`${item.name}: missing file ${file.path}`)
        continue
      }
      if ((file.type === "registry:page" || file.type === "registry:file") && !file.target) {
        errors.push(`${item.name}: ${file.path} is ${file.type} without target`)
      }
      if (file.path.startsWith("components/blocks/")) {
        const src = io.readFile(file.path)
        for (const match of src.matchAll(TEMPLATE_IMPORT)) {
          errors.push(`${item.name}: ${file.path} imports template code ${match[1]}`)
        }
      }
    }
  }
  return errors
}

function main() {
  const root = process.cwd()
  const registry = JSON.parse(readFileSync(resolve(root, "registry.json"), "utf8")) as Registry
  const errors = checkRegistry(registry, {
    fileExists: (p) => existsSync(resolve(root, p)),
    readFile: (p) => readFileSync(resolve(root, p), "utf8"),
  })
  if (errors.length) {
    console.error(errors.join("\n"))
    process.exit(1)
  }
  console.log(`registry ok: ${registry.items.length} items`)
}

const isDirectRun =
  typeof process.argv[1] === "string" && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  main()
}
