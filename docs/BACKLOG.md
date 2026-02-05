# Backlog: Dads-cogs

## Definition of Done (Ship Criteria)

A feature is "done" when:
- [ ] Code compiles without TypeScript errors
- [ ] Feature works in development
- [ ] Feature works in production build
- [ ] No console errors in browser
- [ ] Acceptance criteria met

## Priority Levels

- **P0:** Ship blocker - must fix before any release
- **P1:** Critical for MVP - fix before public launch
- **P2:** Important - fix in first maintenance sprint
- **P3:** Nice to have - backlog for future

---

## NOW (P0 - Ship Blockers)

### PWA-001: Create PWA Icon Assets
**Type:** PWA | **Priority:** P0

**Rationale:** PWA will not install without valid icons. Manifest references files that don't exist.

**Evidence:**
- `public/manifest.json` references `/android-chrome-192x192.png`
- File check: Only `favicon.ico` exists in `public/`

**Acceptance Criteria:**
- [ ] 192x192 PNG icon exists at `public/android-chrome-192x192.png`
- [ ] 512x512 PNG icon exists at `public/android-chrome-512x512.png`
- [ ] 180x180 PNG icon exists at `public/apple-touch-icon.png`
- [ ] Icons display correctly in Chrome DevTools → Application → Manifest

**Effort:** 1 hour

---

### PWA-002: Fix Manifest Fields
**Type:** PWA | **Priority:** P0

**Rationale:** Incomplete manifest prevents proper PWA behavior.

**Evidence:**
- `public/manifest.json` missing `start_url`, `scope`

**Acceptance Criteria:**
- [ ] `start_url` set to `"/"`
- [ ] `scope` set to `"/"`
- [ ] At least one icon marked as `"purpose": "maskable"`

**Effort:** 30 minutes

---

### PWA-003: Add Viewport Meta Tag
**Type:** PWA | **Priority:** P0

**Rationale:** Missing viewport breaks mobile rendering and PWA install.

**Evidence:**
- `src/pages/_document.tsx` has no viewport meta tag

**Acceptance Criteria:**
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">` in Head
- [ ] `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` added

**Effort:** 15 minutes

---

### PWA-004: Implement Service Worker
**Type:** PWA | **Priority:** P0

**Rationale:** No offline support, not a true PWA without service worker.

**Evidence:**
- No SW files in codebase
- No PWA library in `package.json`

**Acceptance Criteria:**
- [ ] Service worker registered on page load
- [ ] Static assets cached on install
- [ ] Offline page displayed when disconnected
- [ ] DevTools shows active service worker

**Effort:** 4 hours

---

### BUILD-001: Create Initial Prisma Migration
**Type:** Build | **Priority:** P0

**Rationale:** No migration history means DB schema cannot be reproduced.

**Evidence:**
- `prisma/` contains only `schema.prisma`, no `migrations/` folder

**Acceptance Criteria:**
- [ ] `prisma/migrations/` directory exists with initial migration
- [ ] `npm run db:migrate` succeeds on fresh database
- [ ] Migration files committed to git

**Effort:** 30 minutes

---

### BUILD-002: Patch Security Vulnerabilities
**Type:** Build | **Priority:** P0

**Rationale:** HIGH severity vulnerabilities in production dependencies.

**Evidence:**
- `npm audit` shows vulnerabilities in next, @trpc/*, next-auth

**Acceptance Criteria:**
- [ ] `npm audit` returns 0 high/critical vulnerabilities
- [ ] Application still builds and runs correctly
- [ ] Auth flow still works after next-auth upgrade

**Effort:** 1 hour

---

### ERROR-001: Add Global Error Boundary
**Type:** Bugfix | **Priority:** P0

**Rationale:** Unhandled errors crash entire app with no recovery.

**Evidence:**
- No `_error.tsx` page
- No React error boundary component

**Acceptance Criteria:**
- [ ] `src/pages/_error.tsx` handles server errors
- [ ] Error boundary component catches client errors
- [ ] User sees friendly error message, not white screen
- [ ] Error logged (console in dev, service in prod)

**Effort:** 2 hours

---

## NEXT (P1 - MVP Requirements)

### TEST-001: Add Critical Path Tests
**Type:** Test | **Priority:** P1

**Rationale:** Voting/scoring logic is business-critical and untested.

**Evidence:**
- 0 test files in codebase
- Vote calculation in `vote.ts` line 146 untested

**Acceptance Criteria:**
- [ ] Test framework configured (Vitest recommended)
- [ ] Unit tests for `updateSubmissionPoints()` function
- [ ] Unit tests for admin authorization checks
- [ ] Tests pass in CI

**Effort:** 6 hours

---

### TYPE-001: Fix TypeScript Any Types
**Type:** Refactor | **Priority:** P1

**Rationale:** `any` types defeat TypeScript benefits.

**Evidence:**
- `src/server/api/routers/vote.ts` line 141: `db: any`
- `src/server/api/routers/vote.ts` line 146: reduce with `any`

**Acceptance Criteria:**
- [ ] All `any` types replaced with proper types
- [ ] `npm run typecheck` passes
- [ ] No new `@ts-ignore` comments

**Effort:** 1 hour

---

### ERROR-002: Use TRPCError Instead of Error
**Type:** Refactor | **Priority:** P1

**Rationale:** Generic errors prevent proper client-side handling.

**Evidence:**
- All routers throw `new Error()` instead of `new TRPCError()`

**Acceptance Criteria:**
- [ ] All throws use `TRPCError` with appropriate codes
- [ ] NOT_FOUND for missing resources
- [ ] FORBIDDEN for permission denied
- [ ] BAD_REQUEST for validation failures

**Effort:** 2 hours

---

### PWA-005: Implement Offline Caching Strategy
**Type:** PWA | **Priority:** P1

**Rationale:** Offline support claimed but not functional.

**Acceptance Criteria:**
- [ ] Previously viewed leagues load when offline
- [ ] API errors show user-friendly offline message
- [ ] Submissions queued when offline (stretch)

**Effort:** 4 hours

---

## LATER (P2 - Post-MVP)

### OBS-001: Add Error Tracking (Sentry)
**Type:** Feature | **Priority:** P2

**Rationale:** Production errors invisible without tracking.

**Acceptance Criteria:**
- [ ] Sentry SDK installed and configured
- [ ] Errors captured with context
- [ ] Source maps uploaded for readable traces

**Effort:** 3 hours

---

### LINT-001: Configure ESLint and Prettier
**Type:** Build | **Priority:** P2

**Rationale:** No code quality enforcement.

**Acceptance Criteria:**
- [ ] ESLint configured with Next.js recommended rules
- [ ] Prettier configured for consistent formatting
- [ ] Pre-commit hook runs linting

**Effort:** 2 hours

---

### CI-001: Set Up GitHub Actions
**Type:** Build | **Priority:** P2

**Rationale:** No automated quality gates.

**Acceptance Criteria:**
- [ ] Workflow runs on PR
- [ ] Type check passes
- [ ] Build succeeds
- [ ] Tests pass (after TEST-001)

**Effort:** 2 hours

---

### A11Y-001: Improve Accessibility
**Type:** Feature | **Priority:** P2

**Rationale:** Emoji ranks have no text alternatives.

**Evidence:**
- `SeasonLeaderboard.tsx` line 28-32: emoji without aria-label

**Acceptance Criteria:**
- [ ] Rank emojis have aria-labels
- [ ] Focus indicators visible
- [ ] axe-core reports no critical issues

**Effort:** 3 hours

---

### FEAT-001: Discord Integration
**Type:** Feature | **Priority:** P3

**Rationale:** Helper functions exist but not called.

**Evidence:**
- `src/server/discord.ts` has notification functions
- Not called in any procedure

**Acceptance Criteria:**
- [ ] Webhook called when round status changes
- [ ] Graceful handling if webhook fails
- [ ] Optional per-league setting

**Effort:** 4 hours

---

## Completed

*(Move items here when done)*

---

## Notes

- Estimates assume familiarity with codebase
- P0 items block any deployment
- P1 items should be done before public launch
- P2/P3 can be addressed in maintenance sprints
