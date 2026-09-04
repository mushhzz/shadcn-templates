#!/usr/bin/env bash
# Installs every registry item into a throwaway Next.js app via the real
# @kit namespace flow (served over local HTTP), then typechecks and builds it.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${SMOKE_DIR:-$(mktemp -d)}"
APP="$WORK/consumer"
PORT="${SMOKE_PORT:-8765}"
SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; fi
  if [ -z "${SMOKE_DIR:-}" ]; then rm -rf "$WORK"; fi
}
trap cleanup EXIT

mkdir -p "$WORK"

echo "▶ building registry"
(cd "$ROOT" && pnpm registry:check && pnpm registry:build)

echo "▶ serving public/r on http://127.0.0.1:$PORT"
(cd "$ROOT/public/r" && python3 -m http.server "$PORT" --bind 127.0.0.1 >"$WORK/server.log" 2>&1) &
SERVER_PID=$!
for _ in $(seq 1 20); do
  curl -sf "http://127.0.0.1:$PORT/registry.json" >/dev/null && break
  sleep 0.5
done
curl -sf "http://127.0.0.1:$PORT/registry.json" >/dev/null || { echo "registry server failed to start"; cat "$WORK/server.log"; exit 1; }

echo "▶ scaffolding consumer app in $APP"
rm -rf "$APP"
(cd "$WORK" && CI=1 npx -y shadcn@latest init -t next -b radix -p nova -y --no-monorepo -n consumer)

echo "▶ configuring @kit namespace in consumer components.json"
node -e '
const fs = require("fs");
const path = process.argv[1];
const cfg = JSON.parse(fs.readFileSync(path, "utf8"));
cfg.registries = { ...(cfg.registries || {}), "@kit": process.argv[2] };
fs.writeFileSync(path, JSON.stringify(cfg, null, 2) + "\n");
' "$APP/components.json" "http://127.0.0.1:$PORT/{name}.json"

echo "▶ installing every registry item"
ITEMS=$(node -e "console.log(require('$ROOT/registry.json').items.map(i=>i.name).join(' '))")
for name in $ITEMS; do
  echo "  + @kit/$name"
  (cd "$APP" && CI=1 npx shadcn@latest add -y "@kit/$name")
done

echo "▶ typecheck + build consumer"
(cd "$APP" && npx tsc --noEmit && npm run build)

echo "✔ smoke install passed for: $ITEMS"
