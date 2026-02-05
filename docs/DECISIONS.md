# Decision & Uncertainty Log

**Evidence Discipline:**
- **VERIFIED:** Confirmed by reading source files or runtime checks
- **INFERENCE:** Reasoned from evidence, with confidence level
- **RESOLVED:** Question answered, decision made

---

## Decisions Made

### DEC-001: Computed Scores on Read (Strategy 4)

**Date:** 2026-02-05
**Decision:** Remove stored `LeagueMember.totalScore`, compute on read via
Prisma `groupBy`. Keep `Submission.totalPoints` as scoped cache.

**Rationale (VERIFIED):**
- Eliminates race conditions in the `finalizeRound` score-increment loop
- Stays within Prisma's typed API (no raw SQL)
- `Submission.totalPoints` is well-scoped (one submission, sum of its votes)
- `LeagueMember.totalScore` was fragile (accumulated across rounds, drifted)

**Implementation:**
- `computeLeagueScores()` helper in `league.ts` uses `submission.groupBy`
- Vote mutations wrapped in `$transaction` for atomicity
- `finalizeRound` simplified to status-only transition

---

### DEC-002: Neon → Prisma Postgres

**Date:** 2026-02-05
**Decision:** Use Prisma Postgres (db.prisma.io) as hosted database.

**Rationale:** Owner set up the project. Zero schema changes needed —
standard PostgreSQL, same Prisma provider.

**Migration:** Initial migration `20260205180604_init` applied successfully.
9 tables, RoundStatus enum, all indexes and foreign keys.

---

### DEC-003: next-auth Stays on Beta (No Stable v5 Exists)

**Date:** 2026-02-05
**Decision:** Pin `next-auth@5.0.0-beta.30`. No migration to stable needed.

**Research findings:**
- next-auth v5 stable was **never released**
- Auth.js merged into Better Auth (September 2025), entered maintenance mode
- beta.30 is the latest release, receives security patches
- API surface is frozen — no breaking changes between beta.25 and beta.30
- Zero code changes required for the upgrade

**Future path:** If active auth development is ever needed (new providers,
MFA, passkeys), migrate to Better Auth. Currently P3.

---

### DEC-004: Keep Hybrid Router Architecture

**Date:** 2026-01-31
**Decision:** Do not refactor to pure App Router or pure Pages Router.

**Rationale (VERIFIED):**
- NextAuth v5 requires App Router for route handlers
- All app pages use Pages Router conventions
- Refactoring adds effort with no user-facing benefit

---

### DEC-005: Skip Full Test Suite for MVP

**Date:** 2026-01-31
**Decision:** Test only critical path (voting/scoring). 16 tests via Vitest.

**Rationale:** Business logic in vote calculation is highest risk. Other
code is framework boilerplate. Coverage can expand post-MVP.

---

### DEC-006: Vitest Over Jest

**Date:** 2026-01-31
**Decision:** Use Vitest for testing.

**Rationale:** Faster ESM support, simpler config, Jest-compatible API.
Added as devDependency on 2026-02-05 (was previously running via npx).

---

### DEC-007: No Shadcn Form Components

**Date:** 2026-02-05
**Decision:** Use plain HTML inputs styled with Tailwind instead of
installing Shadcn Input/Label/Textarea/Select components.

**Rationale:** Keeps dependencies minimal. The form styling matches the
design system using the same Tailwind tokens (border-input, bg-background,
ring-ring, text-muted-foreground). Adding Radix form primitives would be
over-engineering for a hobby project.

**Reversibility:** Easy — can install Shadcn form components later if
needed for complex forms (date pickers, comboboxes).

---

### DEC-008: Remove Dead Service Worker Code

**Date:** 2026-02-05
**Decision:** Delete `src/sw.ts` and `public/sw.js` rather than fixing them.

**Rationale:**
- `src/sw.ts` imported `@serwist/next` which was never installed
- `next.config.js` had no serwist integration
- No code anywhere registered a service worker
- The files suggested a working SW when none existed

Service worker implementation deferred to PWA-001 (P1). Better to have no
SW than broken/misleading code.

---

## Resolved Questions

### OQ-002: Is There a Production Database? → RESOLVED

**Answer:** Yes. Prisma Postgres at db.prisma.io, set up by project owner.
Initial migration applied 2026-02-05.

---

### OQ-006: Should next-auth Stay on Beta? → RESOLVED

**Answer:** Yes. No stable v5 exists. Bumped to latest beta.30 (pinned).
See DEC-003.

---

## Open Questions

### OQ-001: What Are the Brand Assets?

**Question:** What should the PWA icons look like?
**Status:** Placeholder icons generated. Replaceable when real branding exists.

---

### OQ-003: What's the Acceptable Offline Behavior?

**Question:** Should offline users see cached data only, or queue submissions?
**Status:** No SW implemented. Decision deferred to PWA-001.

---

### OQ-004: Is Discord Integration Required for Launch?

**Question:** Must Discord webhooks work before sharing with friends?
**Status:** Open. Helper functions exist. Wiring is ~1 hour of work.

---

### OQ-007: Who Are the Expected Users?

**Question:** Small group of friends, or wider audience?
**Impact:** Determines effort on error tracking, scaling, polish.
**Default assumption:** Small group (friends/family).

---

## Assumptions

### ASM-001: Deployment Target is Vercel

Still assumed. `.gitignore` has `.vercel/`, T3 default is Vercel.

### ASM-004: Single Admin Per League

Verified. `League.adminId` is singular. No multi-admin support.

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2026-01-31 | Claude Cowork | Initial assessment |
| 2026-02-05 | Claude Cowork | Session 2: DEC-001 through DEC-008, resolved OQ-002/006, updated all sections |
