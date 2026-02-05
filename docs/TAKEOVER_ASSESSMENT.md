# Takeover Assessment: Dads-cogs PWA

**Assessment Date:** 2026-01-31
**Assessor:** Claude Cowork (Staff+ Takeover Lead)
**Status:** Mid-flight project requiring completion

---

## 1. Repo Index (Fast Orientation)

### Quick Facts

| Attribute | Value | Evidence |
|-----------|-------|----------|
| **Project Name** | Dads-cogs | `package.json:2` |
| **Purpose** | Music League clone - competitive music sharing/voting | `README.md:3` |
| **Framework** | Next.js 15.2.3 (Pages Router primary, App Router for auth) | `package.json:32` |
| **Language** | TypeScript 5.8.2 (strict mode) | `tsconfig.json` |
| **Runtime** | Node.js 18+ | `README.md:29` |
| **Package Manager** | npm 10.8.2 | `package.json:53` |
| **Database** | PostgreSQL via Prisma 6.6.0 | `prisma/schema.prisma:10` |
| **Auth** | NextAuth.js 5.0.0-beta.25 + Spotify OAuth | `package.json:33` |
| **API Layer** | tRPC 11.7.2 + React Query 5.90.12 | `package.json:25-28` |
| **UI** | Tailwind CSS 4.0.15 + Shadcn/ui | `package.json:41,47` |
| **External APIs** | Spotify Web API, Discord Webhooks | `src/server/spotify.ts`, `src/server/discord.ts` |

### Directory Structure

```
Dads-cogs/
├── prisma/
│   └── schema.prisma          # Database schema (NO migrations!)
├── public/
│   ├── favicon.ico            # Only icon that exists
│   └── manifest.json          # PWA manifest (incomplete)
├── src/
│   ├── app/api/auth/          # NextAuth route handler (App Router)
│   ├── pages/                 # Main routing (Pages Router)
│   │   ├── _app.tsx           # Root with SessionProvider + tRPC
│   │   ├── _document.tsx      # HTML document wrapper
│   │   ├── index.tsx          # Home page
│   │   ├── league/[slug].tsx  # League detail page
│   │   └── api/trpc/          # tRPC endpoint
│   ├── server/
│   │   ├── api/routers/       # tRPC routers (league, round, submission, vote)
│   │   ├── auth/              # NextAuth configuration
│   │   ├── db.ts              # Prisma singleton
│   │   ├── spotify.ts         # Spotify API integration
│   │   └── discord.ts         # Discord webhook helpers
│   ├── components/
│   │   ├── ui/                # Shadcn/ui primitives
│   │   └── SeasonLeaderboard.tsx
│   ├── lib/utils.ts           # Tailwind class merging
│   ├── utils/api.ts           # tRPC client setup
│   └── env.js                 # Environment validation
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## 2. Current State Assessment

### What Works (VERIFIED)

1. **Database Schema** - Well-designed Prisma schema with proper relations, indexes, and constraints
   - Evidence: `prisma/schema.prisma` (160 lines, 9 models)

2. **Authentication** - Spotify OAuth flow configured with token persistence
   - Evidence: `src/server/auth/config.ts` - PrismaAdapter, JWT callbacks

3. **API Layer** - Complete tRPC routers for all domain operations
   - Evidence: `src/server/api/routers/` - league.ts, round.ts, submission.ts, vote.ts

4. **Type Safety** - Strict TypeScript with end-to-end tRPC types
   - Evidence: `tsconfig.json` strict:true, noUncheckedIndexedAccess:true

5. **Basic UI** - Home page and league detail page functional
   - Evidence: `src/pages/index.tsx`, `src/pages/league/[slug].tsx`

### What's Broken/Missing (VERIFIED)

| Issue | Severity | Evidence | Ship Blocker? |
|-------|----------|----------|---------------|
| **PWA icons missing** | CRITICAL | `public/` contains only favicon.ico; manifest references non-existent PNGs | YES |
| **No service worker** | CRITICAL | Zero SW files, no PWA library in dependencies | YES |
| **No Prisma migrations** | HIGH | `prisma/` has only schema.prisma, no migrations/ folder | YES |
| **No tests** | HIGH | Zero test files in entire codebase | YES |
| **No error boundary** | HIGH | No _error.tsx, no React error boundary | YES |
| **Viewport meta missing** | MEDIUM | `_document.tsx` missing viewport tag | YES |
| **Manifest incomplete** | MEDIUM | Missing start_url, scope fields | YES |
| **Beta next-auth** | MEDIUM | v5.0.0-beta.25 in production | MAYBE |
| **No CI/CD** | MEDIUM | No GitHub Actions, Vercel config | NO |
| **No lint/format** | LOW | No ESLint/Prettier configuration | NO |
| **Discord integration incomplete** | LOW | Helper functions exist but not called | NO |

### Risk Register

| Risk | Severity | Likelihood | Mitigation | Owner |
|------|----------|------------|------------|-------|
| Security vulnerabilities in deps | HIGH | CERTAIN | Run npm audit fix, upgrade tRPC/Next.js | Claude Code |
| PWA not installable | HIGH | CERTAIN | Create icons, implement SW, fix manifest | Claude Code |
| DB cannot be reproduced | HIGH | CERTAIN | Create initial Prisma migration | Claude Code |
| Voting logic untested | HIGH | LIKELY | Add unit tests for scoring calculations | Claude Code |
| App crashes on errors | MEDIUM | LIKELY | Add global error boundary | Claude Code |
| Spotify token expiry breaks rounds | MEDIUM | POSSIBLE | Test refresh flow, add error handling | Claude Code |

---

## 3. Runnable Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)
- Spotify Developer account with app credentials

### Environment Setup

```bash
# Copy environment template
cp .env.example .env
```

Required variables:

| Variable | Required | Purpose | How to Get |
|----------|----------|---------|------------|
| `DATABASE_URL` | Yes | PostgreSQL connection | `postgresql://user:pass@host:5432/dbname` |
| `SPOTIFY_CLIENT_ID` | Yes | Spotify OAuth | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) |
| `SPOTIFY_CLIENT_SECRET` | Yes | Spotify OAuth | Same as above |
| `AUTH_SECRET` | Prod only | Session encryption | Run `npx auth secret` |

### Commands

```bash
# Install dependencies
npm install

# Push schema to database (dev)
npm run db:push

# Start development server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build

# Start production server
npm run start

# Preview (build + start)
npm run preview

# Open Prisma Studio (DB GUI)
npm run db:studio
```

### Blockers to Running

1. **BLOCKER:** No DATABASE_URL configured
   - Fix: Create PostgreSQL database, set connection string in .env

2. **BLOCKER:** No Spotify credentials
   - Fix: Create Spotify app, add redirect URI `http://localhost:3000/api/auth/callback/spotify`

3. **WARNING:** First-time setup requires `npm run db:push` to create tables

---

## 4. Technical Debt Summary

### Architecture Decisions (Inherited)

| Decision | Rationale (INFERENCE) | Impact |
|----------|----------------------|--------|
| Hybrid Pages/App Router | NextAuth v5 requires App Router, existing code uses Pages | Medium complexity, works but confusing |
| tRPC over REST | Type safety, T3 Stack convention | Good - no API contracts to maintain |
| No state library | Server state is source of truth via React Query | Good - simpler mental model |
| Schema-first Prisma | Faster iteration in early dev | Tech debt - no migration history |

### Code Quality Observations

- **Good:** Strict TypeScript, Zod validation on all inputs, proper auth middleware
- **Bad:** 2 `any` types in vote.ts, generic Error throws (not TRPCError)
- **Missing:** Tests, error boundaries, logging, observability

---

## 5. Open Questions (Require Human Input)

| Question | Why It Matters | Default Assumption (INFERENCE) |
|----------|----------------|-------------------------------|
| What's the target deployment platform? | Affects CI/CD setup, env vars | Vercel (gitignore has .vercel/) |
| Is Discord integration required for MVP? | Functions exist but unused | No - defer to post-MVP |
| What's the acceptable offline behavior? | Drives SW caching strategy | Show cached data, queue writes |
| Are there existing users/data to migrate? | Affects migration strategy | No - greenfield deployment |
| What's the PWA icon/branding? | Need actual image assets | Create placeholder icons |

---

## 6. Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Build/Run locally | HIGH | Verified npm install, dev server starts |
| Database schema | HIGH | Reviewed full schema, well-structured |
| Auth flow | MEDIUM | Config looks correct, not runtime tested |
| API completeness | MEDIUM | Routers exist, business logic not validated |
| PWA readiness | HIGH (bad) | Verified: icons missing, no SW, manifest incomplete |
| Production readiness | LOW | Missing tests, error handling, observability |

---

## 7. Recommended Approach

### Definition of Done (Ship Criteria)

- [ ] App installs as PWA on mobile (Chrome, Safari)
- [ ] Offline: shows cached content, queues submissions
- [ ] All tRPC procedures have happy-path tests
- [ ] Error boundary catches and displays user-friendly errors
- [ ] Database migrations committed and reproducible
- [ ] Security vulnerabilities patched (npm audit clean)
- [ ] README accurately reflects setup process

### MVP Scope (Minimum to Ship)

**Must Have:**
1. Fix PWA installability (icons, manifest, basic SW)
2. Add global error boundary
3. Create Prisma migrations
4. Patch security vulnerabilities
5. Add critical path tests (voting, scoring)

**Should Have:**
6. Implement offline caching strategy
7. Add observability (error tracking)
8. Fix TypeScript any types

**Won't Have (Post-MVP):**
- Discord webhook integration
- Full test coverage
- CI/CD pipeline
- Performance optimization

### Estimated Effort

| Task | Hours | Priority |
|------|-------|----------|
| PWA icons + manifest | 2 | P0 |
| Service worker + caching | 4 | P0 |
| Error boundary | 2 | P0 |
| Prisma migrations | 1 | P0 |
| Security patches | 1 | P0 |
| Viewport meta fix | 0.5 | P0 |
| Critical tests | 6 | P1 |
| Fix TypeScript issues | 1 | P1 |
| Observability setup | 3 | P2 |
| **Total MVP** | **~20 hours** | |

