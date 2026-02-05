# HANDOFF TO CLAUDE CODE — EXECUTION PROMPT (PASTE AS-IS)

---

## 1) Mission

You are completing the **Dads-cogs** PWA, a Music League clone where users join leagues, submit Spotify tracks to themed rounds, and vote anonymously. The project is mid-flight with working authentication, API layer, and basic UI, but **cannot ship** due to missing PWA implementation, no error handling, and no tests.

**Your mission:** Make this app shippable as a functional PWA.

### Definition of Done Checklist

- [ ] PWA installs on mobile Chrome and Safari (icons, manifest, service worker)
- [ ] Offline mode shows cached content with user-friendly message
- [ ] Global error boundary catches and displays errors gracefully
- [ ] Database migrations committed and reproducible (`npm run db:migrate` works)
- [ ] Security vulnerabilities patched (`npm audit` clean)
- [ ] Critical voting/scoring logic has unit tests
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Production build succeeds (`npm run build`)

---

## 2) Setup

### Clone and Install

```bash
cd /path/to/Dads-cogs
npm install
```

### Environment Variables

Create `.env` with:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dadscogs"
SPOTIFY_CLIENT_ID="your_spotify_client_id"
SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"
AUTH_SECRET="generate_with_npx_auth_secret"
```

### Database Setup

```bash
# First time: push schema
npm run db:push

# After creating migrations:
npm run db:migrate
```

### Development

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run typecheck    # Verify TypeScript
npm run build        # Production build
```

### Testing (after TEST-001)

```bash
npm test             # Run unit tests
npm run test:watch   # Watch mode
```

---

## 3) Tickets (STRICT YAML)

```yaml
tickets:
  - id: PWA-001
    title: "Create PWA icon assets"
    priority: P0
    type: pwa
    rationale: "PWA will not install without valid icons. Manifest references files that don't exist."
    evidence:
      - path: "public/manifest.json"
        note: "References /android-chrome-192x192.png and /android-chrome-512x512.png"
      - path: "public/"
        note: "Directory contains only favicon.ico - no PNG icons"
    touchpoints:
      - "public/android-chrome-192x192.png"
      - "public/android-chrome-512x512.png"
      - "public/apple-touch-icon.png"
    steps:
      - "Create or generate a simple app icon (can be placeholder with 'DC' initials)"
      - "Export as 192x192 PNG to public/android-chrome-192x192.png"
      - "Export as 512x512 PNG to public/android-chrome-512x512.png"
      - "Export as 180x180 PNG to public/apple-touch-icon.png"
      - "Verify files exist and are valid PNGs"
    acceptance_criteria:
      - "ls public/*.png shows all three icon files"
      - "Chrome DevTools → Application → Manifest shows icons loading"
    tests:
      - "file public/android-chrome-192x192.png exists"
      - "file public/android-chrome-512x512.png exists"
    risks:
      - "Placeholder icons may not match desired branding"
    rollback:
      - "Delete generated PNG files"

  - id: PWA-002
    title: "Fix manifest.json fields"
    priority: P0
    type: pwa
    rationale: "Incomplete manifest prevents proper PWA behavior and install."
    evidence:
      - path: "public/manifest.json"
        note: "Missing start_url, scope, and maskable icon purpose"
    touchpoints:
      - "public/manifest.json"
    steps:
      - "Add 'start_url': '/' to manifest"
      - "Add 'scope': '/' to manifest"
      - "Add 'description' field with app summary"
      - "Add 'purpose': 'maskable' to 512x512 icon (duplicate entry)"
      - "Validate JSON syntax"
    acceptance_criteria:
      - "Manifest contains start_url, scope, description"
      - "At least one icon has purpose: maskable"
      - "Chrome DevTools shows no manifest warnings"
    tests:
      - "npm run build succeeds"
      - "JSON.parse(require('fs').readFileSync('public/manifest.json')) succeeds"
    risks:
      - "None - additive change"
    rollback:
      - "git checkout public/manifest.json"

  - id: PWA-003
    title: "Add viewport meta tag"
    priority: P0
    type: pwa
    rationale: "Missing viewport breaks mobile rendering and is required for PWA."
    evidence:
      - path: "src/pages/_document.tsx"
        note: "Head section has PWA tags but no viewport meta"
    touchpoints:
      - "src/pages/_document.tsx"
    steps:
      - "Add <meta name='viewport' content='width=device-width, initial-scale=1' /> to Head"
      - "Add <link rel='apple-touch-icon' href='/apple-touch-icon.png' /> to Head"
    acceptance_criteria:
      - "Mobile view scales correctly in DevTools device mode"
      - "View source shows viewport meta tag in head"
    tests:
      - "npm run build succeeds"
      - "grep 'viewport' src/pages/_document.tsx returns match"
    risks:
      - "None - standard meta tag"
    rollback:
      - "git checkout src/pages/_document.tsx"

  - id: PWA-004
    title: "Implement service worker with Serwist"
    priority: P0
    type: pwa
    rationale: "No offline support exists. Service worker is core PWA requirement."
    evidence:
      - path: "package.json"
        note: "No PWA library in dependencies"
      - path: "next.config.js"
        note: "No PWA plugin configuration"
    touchpoints:
      - "package.json"
      - "next.config.js"
      - "src/sw.ts"
      - "public/sw.js"
      - "tsconfig.json"
    steps:
      - "npm install @serwist/next @serwist/precaching"
      - "Create src/sw.ts with basic precaching config"
      - "Update next.config.js to use withSerwist wrapper"
      - "Add 'src/sw.ts' to tsconfig include if needed"
      - "Run build to generate public/sw.js"
      - "Verify SW registers in browser"
    acceptance_criteria:
      - "Chrome DevTools → Application → Service Workers shows registered SW"
      - "Offline checkbox in Network tab shows cached content, not error"
      - "npm run build generates public/sw.js"
    tests:
      - "npm run build succeeds"
      - "file public/sw.js exists after build"
    risks:
      - "SW caching may serve stale content"
      - "Build time increases slightly"
    rollback:
      - "npm uninstall @serwist/next"
      - "Revert next.config.js"
      - "Delete src/sw.ts and public/sw.js"

  - id: BUILD-001
    title: "Create initial Prisma migration"
    priority: P0
    type: build
    rationale: "No migration history means DB schema cannot be reproduced from source."
    evidence:
      - path: "prisma/"
        note: "Contains only schema.prisma, no migrations/ folder"
    touchpoints:
      - "prisma/migrations/"
      - "prisma/schema.prisma"
    steps:
      - "Run: npx prisma migrate dev --name init"
      - "Verify prisma/migrations/ directory created"
      - "Verify migration SQL file exists"
      - "Test: drop DB, run npm run db:migrate, verify tables created"
    acceptance_criteria:
      - "prisma/migrations/ directory exists with timestamped folder"
      - "Migration contains CREATE TABLE statements for all models"
      - "npm run db:migrate succeeds on fresh database"
    tests:
      - "ls prisma/migrations/ shows at least one migration folder"
      - "npm run db:migrate exits 0"
    risks:
      - "If DB already has data, migration may fail - use db:push instead"
    rollback:
      - "rm -rf prisma/migrations/"

  - id: BUILD-002
    title: "Patch security vulnerabilities"
    priority: P0
    type: build
    rationale: "HIGH severity CVEs in production dependencies."
    evidence:
      - path: "package.json"
        note: "next-auth 5.0.0-beta.25, @trpc/* 11.7.2 have known vulnerabilities"
    touchpoints:
      - "package.json"
      - "package-lock.json"
    steps:
      - "Run: npm audit to see current vulnerabilities"
      - "Run: npm audit fix to auto-fix where possible"
      - "Manually update: npm install next@latest @trpc/client@latest @trpc/server@latest @trpc/next@latest @trpc/react-query@latest"
      - "Check if next-auth stable v5 available, upgrade if so"
      - "Run: npm audit again to verify"
      - "Test: npm run dev, verify auth still works"
    acceptance_criteria:
      - "npm audit shows 0 high/critical vulnerabilities"
      - "App still builds: npm run build"
      - "Auth flow works: can sign in with Spotify"
    tests:
      - "npm audit --audit-level=high exits 0"
      - "npm run build succeeds"
      - "npm run typecheck succeeds"
    risks:
      - "Major version bumps may have breaking changes"
      - "next-auth upgrade may change session shape"
    rollback:
      - "git checkout package.json package-lock.json && npm install"

  - id: ERROR-001
    title: "Add global error boundary"
    priority: P0
    type: bugfix
    rationale: "Unhandled errors crash app with no recovery path."
    evidence:
      - path: "src/pages/"
        note: "No _error.tsx page exists"
      - path: "src/components/"
        note: "No ErrorBoundary component"
    touchpoints:
      - "src/pages/_error.tsx"
      - "src/components/ErrorBoundary.tsx"
      - "src/pages/_app.tsx"
    steps:
      - "Create src/pages/_error.tsx for server-side errors"
      - "Create src/components/ErrorBoundary.tsx React error boundary"
      - "Wrap app content in ErrorBoundary in _app.tsx"
      - "Add user-friendly error UI with retry button"
      - "Log errors to console (Sentry integration later)"
    acceptance_criteria:
      - "Throwing error in component shows error UI, not white screen"
      - "Server errors (500) show custom error page"
      - "Error page has 'Try Again' button that works"
    tests:
      - "npm run build succeeds"
      - "Manually trigger error, verify error UI shows"
    risks:
      - "May hide legitimate errors during development"
    rollback:
      - "Remove ErrorBoundary wrapper from _app.tsx"
      - "Delete error component files"

  - id: TEST-001
    title: "Add critical path unit tests"
    priority: P1
    type: test
    rationale: "Voting/scoring logic is business-critical and completely untested."
    evidence:
      - path: "src/server/api/routers/vote.ts"
        note: "updateSubmissionPoints function calculates scores - untested"
      - path: "src/"
        note: "Zero test files in entire codebase"
    touchpoints:
      - "package.json"
      - "vitest.config.ts"
      - "src/server/api/routers/__tests__/vote.test.ts"
    steps:
      - "npm install -D vitest @vitejs/plugin-react"
      - "Create vitest.config.ts with Next.js compatibility"
      - "Add test script to package.json"
      - "Create __tests__ folder in routers/"
      - "Write tests for updateSubmissionPoints calculation"
      - "Write tests for admin authorization checks"
      - "Run tests and verify passing"
    acceptance_criteria:
      - "npm test runs without error"
      - "Vote calculation tested with multiple scenarios"
      - "Admin auth check tested for allowed/denied cases"
      - "At least 5 test cases passing"
    tests:
      - "npm test exits 0"
    risks:
      - "Tests may reveal bugs in existing logic"
      - "Mock setup for Prisma may be complex"
    rollback:
      - "npm uninstall vitest"
      - "Delete test files and config"

  - id: TYPE-001
    title: "Fix TypeScript any types"
    priority: P1
    type: refactor
    rationale: "any types defeat TypeScript safety in critical vote calculation."
    evidence:
      - path: "src/server/api/routers/vote.ts"
        note: "Line 141: db parameter typed as any"
      - path: "src/server/api/routers/vote.ts"
        note: "Line 146: reduce accumulator typed as any"
    touchpoints:
      - "src/server/api/routers/vote.ts"
    steps:
      - "Import PrismaClient type from @prisma/client"
      - "Replace db: any with db: PrismaClient"
      - "Add proper type to reduce accumulator"
      - "Run npm run typecheck to verify"
    acceptance_criteria:
      - "grep 'any' src/server/api/routers/vote.ts returns no matches"
      - "npm run typecheck passes"
    tests:
      - "npm run typecheck exits 0"
    risks:
      - "May surface additional type errors"
    rollback:
      - "git checkout src/server/api/routers/vote.ts"

  - id: ERROR-002
    title: "Replace Error with TRPCError"
    priority: P1
    type: refactor
    rationale: "Generic errors prevent proper client-side error handling."
    evidence:
      - path: "src/server/api/routers/vote.ts"
        note: "throw new Error('Round not found') should be TRPCError"
      - path: "src/server/api/routers/"
        note: "All routers use Error() instead of TRPCError()"
    touchpoints:
      - "src/server/api/routers/league.ts"
      - "src/server/api/routers/round.ts"
      - "src/server/api/routers/submission.ts"
      - "src/server/api/routers/vote.ts"
    steps:
      - "Import TRPCError from @trpc/server in each router"
      - "Replace throw new Error() with throw new TRPCError({ code: 'XXX', message: '...' })"
      - "Use appropriate codes: NOT_FOUND, FORBIDDEN, BAD_REQUEST, UNAUTHORIZED"
      - "Verify all throws converted"
    acceptance_criteria:
      - "grep 'new Error' src/server/api/routers/*.ts returns no matches (except imports)"
      - "All errors use TRPCError with semantic codes"
      - "npm run typecheck passes"
    tests:
      - "npm run typecheck exits 0"
      - "npm run build succeeds"
    risks:
      - "Client code may need to update error handling"
    rollback:
      - "git checkout src/server/api/routers/"
```

---

## 4) Sub-agent Delegation Plan (for Claude Code)

When implementing these tickets, spawn the following sub-agents:

### Agent: PWA-Implementer
**Scope:** PWA-001, PWA-002, PWA-003, PWA-004
**Inputs:**
- `public/manifest.json`
- `src/pages/_document.tsx`
- `next.config.js`
- `package.json`

**Expected Outputs:**
- New icon files in `public/`
- Updated manifest.json
- Updated _document.tsx with viewport
- New `src/sw.ts` service worker
- Updated next.config.js with Serwist

**Integration Protocol:**
- Run `npm run build` after all changes
- Verify in Chrome DevTools → Application → Manifest
- Test offline checkbox in Network tab

### Agent: Build-Fixer
**Scope:** BUILD-001, BUILD-002
**Inputs:**
- `prisma/schema.prisma`
- `package.json`
- `package-lock.json`

**Expected Outputs:**
- `prisma/migrations/` directory with initial migration
- Updated package.json with patched versions
- Updated package-lock.json

**Integration Protocol:**
- Run `npm run db:migrate` on test database
- Run `npm audit` to verify clean
- Run `npm run typecheck` and `npm run build`

### Agent: Error-Handler
**Scope:** ERROR-001, ERROR-002
**Inputs:**
- `src/pages/_app.tsx`
- `src/server/api/routers/*.ts`

**Expected Outputs:**
- New `src/pages/_error.tsx`
- New `src/components/ErrorBoundary.tsx`
- Updated _app.tsx with boundary wrapper
- Updated routers with TRPCError

**Integration Protocol:**
- Manually trigger error to test boundary
- Run `npm run typecheck`

### Agent: Test-Writer
**Scope:** TEST-001, TYPE-001
**Inputs:**
- `src/server/api/routers/vote.ts`
- `package.json`

**Expected Outputs:**
- `vitest.config.ts`
- `src/server/api/routers/__tests__/vote.test.ts`
- Updated package.json with test script
- Fixed types in vote.ts

**Integration Protocol:**
- Run `npm test` and verify passing
- Run `npm run typecheck`

---

## 5) Stop Conditions

**STOP and ask for clarification if:**

1. **Missing environment secrets**
   - DATABASE_URL not set or database unreachable
   - SPOTIFY_CLIENT_ID/SECRET not configured
   - Cannot test auth flow

2. **Ambiguous product requirements**
   - Unclear what offline behavior should be
   - Questions about branding/icons
   - Scope creep beyond defined tickets

3. **Failing tests with unclear ownership**
   - Existing functionality breaks after changes
   - Cannot determine if failure is regression or pre-existing

4. **API contract unknown**
   - Spotify API returns unexpected responses
   - NextAuth session shape changes after upgrade
   - tRPC types don't match after version bump

5. **Dependency conflicts**
   - npm install fails with peer dependency issues
   - Package versions incompatible

6. **Database issues**
   - Migration fails on existing data
   - Schema changes would lose data

---

## 6) Open Questions Table

| Question | Why it matters | Fastest way to answer | Default assumption if unanswered (INFERENCE) |
|----------|----------------|----------------------|---------------------------------------------|
| What should PWA icons look like? | Required for install | Ask stakeholder for logo | Generate placeholder with "DC" text |
| Is there production data? | Affects migration strategy | Check DATABASE_URL | No - greenfield deployment |
| What offline behavior is expected? | Drives caching complexity | Product decision | Read-only: show cached, block mutations |
| Is Discord integration required? | Affects MVP scope | Ask stakeholder | No - defer to post-MVP |
| Target Node.js version? | CI/CD configuration | Check hosting requirements | Node 18 LTS |
| Acceptable to stay on next-auth beta? | Security implications | Check for stable v5 release | Upgrade to latest available |

---

## Execution Order

**Phase 1 (Parallel):**
- PWA-001, PWA-002, PWA-003 (icons and manifest)
- BUILD-001 (migrations)
- BUILD-002 (security patches)

**Phase 2 (After Phase 1):**
- PWA-004 (service worker - needs build to work)
- ERROR-001 (error boundary)

**Phase 3 (After Phase 2):**
- TEST-001 (tests)
- TYPE-001, ERROR-002 (refactors)

**Verification:**
After all phases, run:
```bash
npm run typecheck
npm run build
npm test
npm audit
```

All must pass before considering "done."
