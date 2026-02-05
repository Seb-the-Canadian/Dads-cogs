# Backlog: Dads-cogs

> Last reconciled against codebase: 2026-02-05

## Priority Levels

- **P0:** Ship blocker — must fix before any deployment
- **P1:** Critical for MVP — fix before sharing with the group
- **P2:** Important — first maintenance pass
- **P3:** Nice to have — future

---

## P0 — Ship Blockers

### FIX-001: Fix tRPC client transformer config
**Type:** Bugfix

The 2 remaining type errors in the build. tRPC 11 moved the `transformer`
option from `createTRPCNext` config to individual link options
(`httpBatchLink`). The current code puts `superjson` at the top-level config
which is the old tRPC 10 pattern.

**File:** `src/utils/api.ts:17,24`

**Acceptance Criteria:**
- [ ] Move `transformer: superjson` into `httpBatchLink()` options
- [ ] Remove top-level `transformer` from config
- [ ] `npx tsc --noEmit` exits 0

---

### FIX-002: Create initial Prisma migration
**Type:** Build

No `prisma/migrations/` directory exists. Schema can only be applied via
`db push` (destructive). A proper migration history is needed for
reproducible deployments and safe schema evolution.

**File:** `prisma/` (only `schema.prisma` exists)

**Acceptance Criteria:**
- [ ] `prisma/migrations/` directory with initial migration
- [ ] `npx prisma migrate dev` succeeds on a fresh database
- [ ] Migration files committed to git

**Depends on:** A running PostgreSQL instance (local or Neon)

---

### FIX-003: Fix manifest.json for PWA installability
**Type:** PWA

Missing `start_url` and `scope` fields. No icon marked `maskable`. Chrome
will refuse to show the install prompt without these.

**File:** `public/manifest.json`

**Acceptance Criteria:**
- [ ] `start_url` set to `"/"`
- [ ] `scope` set to `"/"`
- [ ] At least one icon has `"purpose": "maskable"`

---

### FIX-004: Add viewport meta and apple-touch-icon
**Type:** PWA

`_document.tsx` has PWA meta tags but is missing the viewport meta tag
(breaks mobile rendering) and apple-touch-icon link (iOS home screen).

**File:** `src/pages/_document.tsx`

**Acceptance Criteria:**
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1" />` in Head
- [ ] `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` in Head

---

### FIX-005: Wire up ErrorBoundary in _app.tsx
**Type:** Bugfix

`ErrorBoundary.tsx` exists but is never rendered. Unhandled client-side
errors will still crash the app with a white screen.

**File:** `src/pages/_app.tsx`

**Acceptance Criteria:**
- [ ] `<ErrorBoundary>` wraps `<Component />` in `_app.tsx`
- [ ] Throwing an error in a component shows the error UI, not a white screen

---

## P1 — MVP (before sharing with the group)

### PWA-001: Implement working service worker
**Type:** PWA

`src/sw.ts` imports `@serwist/next` but the package is not installed and
`next.config.js` has no serwist integration. The file is dead code.
`public/sw.js` is a 2-line static stub that does nothing useful.

**Options:**
- A) Install `@serwist/next`, wire into next.config.js, keep sw.ts
- B) Remove sw.ts, write a minimal hand-rolled SW in public/sw.js
- C) Remove all SW code for now, add it when offline support matters

**Acceptance Criteria (if A or B):**
- [ ] Service worker registered on page load
- [ ] Static assets cached
- [ ] DevTools → Application shows active service worker
- [ ] `@serwist/next` in package.json (if option A)

---

### SEC-001: Upgrade next-auth from beta
**Type:** Security

Running `next-auth@5.0.0-beta.25`. Stable v5 has been released. Beta
versions have known CVEs and won't receive patches.

**File:** `package.json:33`

**Acceptance Criteria:**
- [ ] `next-auth` upgraded to latest stable v5
- [ ] Auth flow still works (Spotify OAuth login/logout)
- [ ] No new type errors introduced

---

### SEC-002: Run npm audit and patch vulnerabilities
**Type:** Security

Inherited vulnerabilities from pinned beta dependencies. Should be
addressed after SEC-001 since many will resolve with the upgrade.

**Acceptance Criteria:**
- [ ] `npm audit` returns 0 high/critical vulnerabilities
- [ ] App still builds and runs

---

## P2 — Post-MVP Maintenance

### FEAT-001: Missing pages (create league, submit track, voting UI)
**Type:** Feature

The app currently has index and league detail pages. Three critical user
flows have no UI:
- Create a new league
- Submit a track to a round
- Cast votes on submissions

The tRPC routers for all three exist. These need pages/components.

---

### FEAT-002: Wire up Discord webhook notifications
**Type:** Feature

`src/server/discord.ts` has complete helper functions for posting round
status changes to Discord. None are called from any router.

**Acceptance Criteria:**
- [ ] Webhook fires on round status transitions
- [ ] Graceful failure if webhook URL missing or request fails
- [ ] Optional per-league (controlled by `discordWebhookUrl` field)

---

### DX-001: Set up CI (GitHub Actions)
**Type:** Build

No automated checks on push or PR. Minimum pipeline: type-check, test,
build.

---

### DX-002: Configure ESLint
**Type:** Build

No linting configured. T3 ships with ESLint but it was removed or never
set up.

---

### OBS-001: Add error tracking (Sentry or similar)
**Type:** Feature

Production errors are invisible. ErrorBoundary catches them client-side
but doesn't report anywhere.

---

### A11Y-001: Accessibility improvements
**Type:** Feature

`SeasonLeaderboard.tsx` uses emoji for rank indicators without
`aria-label`. Focus indicators may also be missing.

---

## Completed

| ID | Description | Completed |
|----|-------------|-----------|
| PWA-ICONS | PWA icon assets (192, 512, apple-touch) | 2026-02-05 |
| ERROR-001 | ErrorBoundary component + _error.tsx page | 2026-02-05 |
| ERROR-002 | TRPCError in vote.ts (replaces generic Error) | 2026-02-05 |
| TYPE-001 | Remove `any` types in vote.ts | 2026-02-05 |
| TEST-001 | Vote calculation tests (16 cases, vitest) | 2026-02-05 |
| SCORE-001 | Computed leaderboard scores via groupBy | 2026-02-05 |
| SCORE-002 | Transaction safety on vote mutations | 2026-02-05 |
