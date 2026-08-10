#!/usr/bin/env bash
# Runs migrations + integration (e2e) tests against the dedicated TEST database.
set -euo pipefail

here="$(cd "$(dirname "$0")/.." && pwd)"
cd "$here"

# Export vars from .env (best-effort; env may already be set in CI).
if [ -f "$here/.env" ]; then
  # shellcheck disable=SC1091
  set -a
  # shellcheck disable=SC1091
  . "$here/.env"
  set +a
fi

# Point Prisma + the app at the test database and disable throttling for tests.
export DATABASE_URL="${DATABASE_URL_TEST:-$DATABASE_URL}"
export NODE_ENV=test

echo "==> Migrations on test DB"
npx prisma migrate deploy

echo "==> Integration tests"
npx jest --runInBand --testPathPattern='(\.|/)e2e-spec\.ts$'