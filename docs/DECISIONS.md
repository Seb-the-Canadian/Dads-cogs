# Decision & Uncertainty Log

## About This Document

This log captures decisions made during the takeover assessment, assumptions that were necessary to proceed, and open questions that require human input.

**Evidence Discipline:**
- **VERIFIED:** Confirmed by reading source files
- **INFERENCE:** Reasoned from evidence, with confidence level
- **OPEN QUESTION:** Unknown, requires human input

---

## Decisions Made

### DEC-001: PWA Implementation Approach

**Decision:** Use `@serwist/next` for service worker implementation

**Rationale (INFERENCE, HIGH confidence):**
- Modern, actively maintained fork of workbox
- First-class Next.js support
- Better TypeScript types than alternatives
- Simpler configuration than raw workbox

**Alternatives Considered:**
- `next-pwa` - Popular but less maintained
- `@ducanh2912/next-pwa` - Fork of next-pwa, also viable
- Raw workbox - More control but more complexity

**Reversibility:** Easy - just swap the library

---

### DEC-002: Skip Full Test Suite for MVP

**Decision:** Add only critical path tests (voting/scoring), not comprehensive coverage

**Rationale (INFERENCE, MEDIUM confidence):**
- Time constraint: full coverage would take 20+ hours
- Business logic in vote calculation is highest risk
- Other code is largely framework boilerplate
- Can expand coverage post-MVP

**Risk:** Other bugs may ship undetected

**Reversibility:** Easy - add more tests later

---

### DEC-003: Keep Hybrid Router Architecture

**Decision:** Do not refactor to pure App Router or pure Pages Router

**Rationale (VERIFIED):**
- NextAuth v5 requires App Router for route handlers (`src/app/api/auth/`)
- Existing pages use Pages Router conventions
- Refactoring would be significant effort with no ship benefit

**Evidence:** `src/app/api/auth/[...nextauth]/route.ts` exists alongside `src/pages/`

**Reversibility:** Possible but expensive

---

### DEC-004: Defer Discord Integration

**Decision:** Mark Discord webhook integration as P3 (post-MVP)

**Rationale (INFERENCE, HIGH confidence):**
- Feature is incomplete - functions exist but aren't called
- Not blocking core user flows
- League admins can manually notify members

**Evidence:** `src/server/discord.ts` has helper functions never imported by routers

**Reversibility:** Easy - just wire up the calls

---

### DEC-005: Create Icons as Placeholders

**Decision:** Generate simple placeholder icons to unblock PWA

**Rationale (INFERENCE, MEDIUM confidence):**
- No existing brand assets in repo
- PWA blocked until icons exist
- Placeholders can be replaced with real branding later

**Alternative:** Wait for design assets from stakeholder

**Reversibility:** Easy - replace icon files

---

### DEC-006: Use Vitest Over Jest

**Decision:** Recommend Vitest for test framework

**Rationale (INFERENCE, HIGH confidence):**
- Faster than Jest with native ESM support
- Better Vite/Next.js integration
- Simpler configuration
- Compatible with Jest API

**Alternative:** Jest is also viable and more established

---

## Assumptions Made

### ASM-001: Deployment Target is Vercel

**Assumption:** Project will deploy to Vercel

**Basis (INFERENCE, MEDIUM confidence):**
- `.gitignore` includes `.vercel/` directory
- T3 Stack default is Vercel
- README mentions `vercel deploy`

**If wrong:** Adjust CI/CD and environment variable documentation

---

### ASM-002: No Existing Production Data

**Assumption:** This is greenfield deployment, no data migration needed

**Basis (INFERENCE, MEDIUM confidence):**
- No migration files exist
- No references to production URLs
- Project appears to be in development

**If wrong:** Need data migration strategy

---

### ASM-003: PostgreSQL is Required Database

**Assumption:** Project requires PostgreSQL, not SQLite or other

**Basis (VERIFIED):**
- `prisma/schema.prisma` line 10: `provider = "postgresql"`
- README specifies PostgreSQL

**Evidence:** Schema uses PostgreSQL-specific features

---

### ASM-004: Single Admin Per League

**Assumption:** Each league has exactly one admin (creator)

**Basis (VERIFIED):**
- Schema: `League.adminId` is singular, not a relation to many
- No admin transfer or multi-admin functionality in routers

**Evidence:** `prisma/schema.prisma` line 72-73

---

### ASM-005: Offline Writes Not Required for MVP

**Assumption:** Offline mode only needs to show cached data, not queue submissions

**Basis (INFERENCE, LOW confidence):**
- README claims "offline support" without specifics
- Offline write queuing is complex
- Read-only offline is achievable in timeline

**If wrong:** Need to implement background sync

---

## Open Questions

### OQ-001: What Are the Brand Assets?

**Question:** What should the PWA icons look like?

**Why it matters:** Icons are required for PWA install but none exist

**Fastest resolution:** Stakeholder provides logo files

**Default (INFERENCE):** Generate placeholder with app name initials

---

### OQ-002: Is There a Production Database?

**Question:** Does a production PostgreSQL instance already exist?

**Why it matters:** Determines migration strategy and deployment approach

**Fastest resolution:** Ask project owner

**Default (INFERENCE):** Assume greenfield, create new database

---

### OQ-003: What's the Acceptable Offline Behavior?

**Question:** Should offline users see cached data only, or queue submissions?

**Why it matters:** Significantly affects service worker complexity

**Fastest resolution:** Product decision from stakeholder

**Default (INFERENCE):** Read-only offline (show cached, block mutations)

---

### OQ-004: Is Discord Integration Required for Launch?

**Question:** Must Discord webhooks work before shipping?

**Why it matters:** Feature is partially built but not wired up

**Fastest resolution:** Ask project owner

**Default (INFERENCE):** No - defer to post-MVP

---

### OQ-005: What's the Target Node Version?

**Question:** Specific Node.js version required?

**Why it matters:** Affects CI/CD and deployment configuration

**Fastest resolution:** Check hosting provider requirements

**Default (INFERENCE):** Node 18 LTS (mentioned in README)

**Evidence:** `README.md` line 29: "Node.js 18+"

---

### OQ-006: Should next-auth Stay on Beta?

**Question:** Upgrade to stable v5, or stay on beta.25?

**Why it matters:** Beta has known vulnerabilities, stable may have breaking changes

**Fastest resolution:** Check if stable v5 released, test auth flow

**Default (INFERENCE):** Upgrade to latest v5 (stable if available)

---

### OQ-007: Who Are the Expected Users?

**Question:** Is this for personal use, small group, or public launch?

**Why it matters:** Affects testing rigor, error tracking, and scaling decisions

**Fastest resolution:** Ask project owner

**Default (INFERENCE):** Small group (friends/family) based on README tone

---

## Verified Facts

### VF-001: Icons Do Not Exist
- **Claim:** PWA icons are missing
- **Evidence:** `ls -la public/` shows only `favicon.ico` and `manifest.json`
- **Status:** VERIFIED

### VF-002: No Prisma Migrations
- **Claim:** Migration history doesn't exist
- **Evidence:** `ls -la prisma/` shows only `schema.prisma`
- **Status:** VERIFIED

### VF-003: No Service Worker
- **Claim:** PWA service worker not implemented
- **Evidence:** Grep for "serviceWorker", "sw.js", "@serwist", "next-pwa" returns nothing
- **Status:** VERIFIED

### VF-004: Viewport Meta Missing
- **Claim:** Viewport meta tag not in document
- **Evidence:** `src/pages/_document.tsx` Head contains no viewport tag
- **Status:** VERIFIED

### VF-005: Zero Test Files
- **Claim:** No tests exist
- **Evidence:** Glob for `*.test.ts`, `*.spec.ts`, `__tests__` returns nothing
- **Status:** VERIFIED

### VF-006: next-auth Is Beta Version
- **Claim:** Using pre-release NextAuth
- **Evidence:** `package.json` line 33: `"next-auth": "5.0.0-beta.25"`
- **Status:** VERIFIED

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2026-01-31 | Claude Cowork | Initial assessment |
