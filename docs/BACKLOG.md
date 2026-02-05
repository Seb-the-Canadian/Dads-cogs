# Backlog: Dads-cogs

> Last reconciled against codebase: 2026-02-05 (session 3, post-P1)

## Priority Levels

- **P0:** Ship blocker — must fix before any deployment
- **P1:** Critical for MVP — fix before sharing with the group
- **P2:** Important — first maintenance pass
- **P3:** Nice to have — future

---

## P0 — Ship Blockers

**All P0 items resolved.**

---

## P1 — MVP (before sharing with the group)

### UX-004: Round status advancement UI (admin)
**Type:** Feature
**Priority justification:** Without this, admins cannot move rounds through
their lifecycle. The app is unusable for running an actual game.

The `round.updateStatus` and `vote.finalizeRound` procedures exist in the
backend but are not called from any page. Admins need buttons on the round
detail page to advance status:

- SUBMISSION → VOTING (when submissions close)
- VOTING → COMPLETED (triggers `finalizeRound` to lock scores)

**Files involved:**
- `src/pages/round/[id].tsx` — add admin controls section
- `src/server/api/routers/round.ts` — `updateStatus` procedure (exists)
- `src/server/api/routers/vote.ts` — `finalizeRound` procedure (exists)

**Acceptance Criteria:**
- [ ] Admin sees "Advance to Voting" button during SUBMISSION phase
- [ ] Admin sees "Finalize Round" button during VOTING phase
- [ ] Non-admins do not see status controls
- [ ] Confirmation prompt before status change (irreversible)
- [ ] Status badge updates immediately after transition

---

### PWA-001: Service worker decision
**Type:** PWA

Dead SW code was removed in session 2. No service worker exists. The
manifest.json is configured but no SW registration occurs.

**Options:**
- A) Install `@serwist/next`, wire into next.config.js
- B) Hand-roll minimal SW in public/sw.js
- C) Defer until deployment — app works fine without it

**Recommendation:** Option C. The app functions without a SW. Revisit after
first deployment when real offline behavior is observed.

---

## P2 — Post-MVP Maintenance

### FEAT-002: Wire up Discord webhook notifications
**Type:** Feature

`src/server/discord.ts` has complete helper functions for posting round
status changes to Discord. Three notification types are defined but none
are called from any router:
- `createRoundStartNotification()` — round submission opens
- `createVotingStartNotification()` — voting opens
- `createRoundCompleteNotification()` — round done, shows top 3

**Wiring point:** `round.updateStatus` in `src/server/api/routers/round.ts`.
Call the appropriate Discord function after each status transition. Requires
loading the league's `discordWebhookUrl`.

**Acceptance Criteria:**
- [ ] Webhook fires on round status transitions
- [ ] Graceful failure if webhook URL missing or request fails
- [ ] Optional per-league (controlled by `discordWebhookUrl` field)

---

### UX-005: Leave league
**Type:** Feature

No way for a member to leave a league. `LeagueMember` records are created
via `league.join` but cannot be removed. Needs a `league.leave` procedure
and a button on the league detail page.

**Constraints:**
- League admin cannot leave (would orphan the league)
- Leaving should remove the `LeagueMember` row
- Past submissions/votes in completed rounds remain (data integrity)

---

### DX-001: Set up CI (GitHub Actions)
**Type:** Build

No automated checks on push or PR. Minimum pipeline: type-check, test,
build.

---

### DX-002: Configure ESLint
**Type:** Build

No `.eslintrc*` or `eslint.config.*` exists. No `lint` script in
package.json. Code style is maintained manually.

---

### DX-003: Add test script to package.json
**Type:** Build

`vitest` is installed as a devDependency and the test suite runs via
`npx vitest --run`, but there is no `"test"` script in package.json.
Add `"test": "vitest --run"` for convenience and CI use.

---

### OBS-001: Add error tracking (Sentry or similar)
**Type:** Feature

Production errors are invisible. ErrorBoundary catches them client-side
but doesn't report anywhere. Console-only logging in `discord.ts`.

---

### A11Y-001: Accessibility improvements
**Type:** Feature

`SeasonLeaderboard.tsx` rank emojis (lines 29-31) lack `aria-label`.
`VotingPanel.tsx` vote buttons are reasonably accessible but could benefit
from descriptive `aria-label` attributes (e.g., "Give 3 points to Track
Name").

---

## P3 — Future

### AUTH-001: Evaluate Better Auth migration
**Type:** Architecture

Auth.js (next-auth) entered maintenance mode in September 2025 after
merging into Better Auth. Currently on beta.30 (latest, API frozen).
No action needed unless new auth features are required.

---

### UX-006: Spotify search (full autocomplete)
**Type:** Feature

Current submission flow uses URL paste + metadata lookup (DEC-010). If
users find this cumbersome, a full Spotify search with autocomplete could
be built. Would need a new `submission.searchTracks` procedure, debounced
input, and results dropdown.

---

## Completed

| ID | Description | Completed |
|----|-------------|-----------|
| PWA-ICONS | PWA icon assets (192, 512, apple-touch) | 2026-02-05 |
| ERROR-001 | ErrorBoundary component + _error.tsx page | 2026-02-05 |
| ERROR-002 | TRPCError in vote.ts and round.ts | 2026-02-05 |
| TYPE-001 | Remove `any` types, fix Prisma import paths | 2026-02-05 |
| TEST-001 | Vote calculation tests (16 cases, vitest) | 2026-02-05 |
| SCORE-001 | Computed leaderboard scores via groupBy | 2026-02-05 |
| SCORE-002 | Transaction safety on vote mutations | 2026-02-05 |
| FIX-001 | tRPC transformer config (tRPC 11 API) | 2026-02-05 |
| FIX-002 | Initial Prisma migration (Prisma Postgres) | 2026-02-05 |
| FIX-003 | manifest.json: start_url, scope, maskable | 2026-02-05 |
| FIX-004 | Viewport meta + apple-touch-icon in _document | 2026-02-05 |
| FIX-005 | ErrorBoundary wired into _app.tsx | 2026-02-05 |
| SEC-001 | next-auth 5.0.0-beta.25 → beta.30 (pinned) | 2026-02-05 |
| SEC-002 | npm audit: 5 high → 0 vulnerabilities | 2026-02-05 |
| FEAT-001 | Create league, round detail, submission, voting pages | 2026-02-05 |
| CLEANUP | Removed dead SW code (src/sw.ts, public/sw.js) | 2026-02-05 |
| ROUND-TS | round.ts: fixed import path, TRPCError, nativeEnum | 2026-02-05 |
| VITEST | vitest + @vitejs/plugin-react as devDependencies | 2026-02-05 |
| UX-001 | Create Round page (/round/create) + admin button on league detail | 2026-02-05 |
| UX-002 | Join League page (/league/join) + CONFLICT error handling | 2026-02-05 |
| UX-003 | Spotify URL lookup + auto-fill submission form | 2026-02-05 |
