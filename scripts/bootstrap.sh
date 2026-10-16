#!/usr/bin/env bash
# Takes a fresh clone to runnable. Idempotent — safe to re-run.
set -euo pipefail
trap 'echo "❌ Error on line $LINENO"' ERR

cd "$(dirname "$0")/.."

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; NC='\033[0m'
info() { echo -e "${BLUE}==>${NC} $1"; }
ok()   { echo -e "${GREEN} ok${NC} $1"; }
warn() { echo -e "${YELLOW} !!${NC} $1"; }

info "Checking toolchain"
REQUIRED_NODE=$(cat .nvmrc)
ACTUAL_NODE=$(node -v | sed 's/^v//' | cut -d. -f1)
if [ "$ACTUAL_NODE" != "$REQUIRED_NODE" ]; then
  warn "Node $ACTUAL_NODE is active but .nvmrc asks for $REQUIRED_NODE. Run: nvm use"
else
  ok "Node $ACTUAL_NODE"
fi

info "Installing dependencies"
# A stray lockfile in a workspace breaks hoisting of shared deps like drizzle-orm.
find packages -maxdepth 2 -name package-lock.json -delete 2>/dev/null || true
npm install
ok "Dependencies installed"

# Nothing else can typecheck until it exists.
info "Building @player-ledger/shared"
npm run build -w @player-ledger/shared
ok "shared built"

info "Creating .env files"
for example in packages/*/.env.example; do
  [ -f "$example" ] || continue
  target="${example%.example}"
  if [ -f "$target" ]; then
    ok "$target already exists, left alone"
  else
    cp "$example" "$target"
    ok "created $target"
  fi
done

info "Running migrations"
npm run db:migrate
ok "Migrations applied"

echo ""
echo " Bootstrap complete. Start developing with:"
echo ""
echo "   npm run dev       # shared + api + web"
echo ""
echo " Ports:  api 38471   web 38472"
echo ""
