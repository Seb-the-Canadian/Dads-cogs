# Backlog: Dads-cogs

> Last reconciled against codebase: 2026-02-05 (session 2)

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

### UX-001: Create Round page (admin)
**Type:** Feature

The `round.create` router exists but there's no UI for league admins to
create a new round. Admins need to set theme, description, and
submission/voting date windows.

**Calls:** `api.round.create` (protected, admin-only)

**Acceptance Criteria:**
- [ ] Admin can create a round from the league detail page
- [ ] Date pickers for submission and voting windows
- [ ] Round appears in league rounds list after creation

---

### UX-002: Join League page/flow
**Type:** Feature

`league.join` router exists but no UI calls it. Friends need a way to
join a league by slug or invite link.

**Calls:** `api.league.join` (protected)

**Acceptance Criteria:**
- [ ] User can join a league by entering a slug or visiting a link
- [ ] User appears in league members list after joining

---

### UX-003: Spotify track search for submissions
**Type:** Feature

The submission form currently requires manually entering a Spotify Track
ID, track name, and artist name. Non-technical users won't know how to
find a Track ID.

**Options:**
- A) Add Spotify search API endpoint — user types song name, picks result
- B) Accept a Spotify track URL and parse the ID from it
- C) Keep manual entry (workable but friction-heavy)

**Acceptance Criteria (if A):**
- [ ] Search input that queries Spotify API
- [ ] Results populate track name, artist, album art, track ID automatically
- [ ] User just picks from results and submits

---

### PWA-001: Service worker decision
**Type:** PWA

Dead SW code was removed. No service worker exists. Needed for offline
caching and PWA install prompt.

**Options:**
- A) Install `@serwist/next`, wire into next.config.js
- B) Hand-roll minimal SW in public/sw.js
- C) Defer until deployment — app works fine without it

---

## P2 — Post-MVP Maintenance

### FEAT-002: Wire up Discord webhook notifications
**Type:** Feature

`src/server/discord.ts` has complete helper functions for posting round
status changes to Discord. None are called from any router.

Three notification types ready to wire:
- Round started (submission open)
- Voting started
- Round completed (with top 3 results)

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

No linting configured.

---

### OBS-001: Add error tracking (Sentry or similar)
**Type:** Feature

Production errors are invisible. ErrorBoundary catches them client-side
but doesn't report anywhere.

---

### A11Y-001: Accessibility improvements
**Type:** Feature

`SeasonLeaderboard.tsx` and `VotingPanel.tsx` use emoji for rank indicators
without `aria-label`. Vote buttons lack descriptive labels for screen
readers.

---

## P3 — Future

### AUTH-001: Evaluate Better Auth migration
**Type:** Architecture

Auth.js (next-auth) entered maintenance mode in September 2025 after
merging into Better Auth. Currently on beta.30 (latest, API frozen).
No action needed unless new auth features are required.

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
