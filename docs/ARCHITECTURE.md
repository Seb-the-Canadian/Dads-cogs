# Architecture: Dads-cogs

## Overview

Dads-cogs is a Music League clone built on the T3 Stack. Users join Leagues (seasons), submit Spotify tracks to themed Rounds, vote anonymously, and compete for season-long leaderboard positions.

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 15.2.3 | React framework with SSR/SSG |
| Language | TypeScript | 5.8.2 | Type safety |
| Runtime | Node.js | 18+ | Server runtime |
| Database | PostgreSQL | - | Data persistence |
| ORM | Prisma | 6.6.0 | Database access |
| Auth | NextAuth.js | 5.0.0-beta.25 | Spotify OAuth |
| API | tRPC | 11.7.2 | Type-safe RPC |
| State | React Query | 5.90.12 | Server state caching |
| Styling | Tailwind CSS | 4.0.15 | Utility-first CSS |
| UI | Shadcn/ui | - | Radix-based components |
| Validation | Zod | 3.25.76 | Schema validation |

## Routing Architecture

**Hybrid Router Setup:**
- `src/pages/` - Primary routing (Pages Router)
- `src/app/api/auth/` - NextAuth v5 route handler (App Router)

```
Routes:
/                        → pages/index.tsx (Home, league list)
/league/[slug]          → pages/league/[slug].tsx (League detail)
/api/trpc/[trpc]        → pages/api/trpc/[trpc].ts (tRPC batch endpoint)
/api/auth/*             → app/api/auth/[...nextauth]/route.ts (OAuth)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ React Page   │───▶│ tRPC Hook    │───▶│ React Query  │      │
│  │ (league/*)   │    │ useQuery()   │    │ Cache        │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTP POST /api/trpc/[trpc]
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ tRPC Router  │───▶│ Procedure    │───▶│ Prisma       │      │
│  │ (context)    │    │ (validation) │    │ Client       │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                                        │               │
│         │                                        ▼               │
│         │                               ┌──────────────┐        │
│         │                               │ PostgreSQL   │        │
│         │                               └──────────────┘        │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐    ┌──────────────┐                           │
│  │ Spotify API  │    │ Discord API  │ (webhooks, optional)      │
│  └──────────────┘    └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

## Domain Model

### Core Entities

```
User (1) ─────────────────────────────────────────┐
  │                                                │
  │ owns                                           │ member of
  ▼                                                ▼
League (N) ◀────────────────────────────────── LeagueMember (N)
  │                                                │
  │ contains                                       │ tracks score
  ▼                                                │
Round (N) ─────────────────────────────────────────┘
  │
  │ receives
  ▼
Submission (N) ◀──── Vote (N)
```

### Entity Details

**User** (NextAuth managed)
- id, name, email, image
- Relations: accounts, sessions, memberships, submissions, votes, ownedLeagues

**League** (Season container)
- id, name, slug (unique), adminId, discordWebhookUrl, status
- Admin creates rounds, manages league
- Members join via slug

**LeagueMember** (Participation + scoring)
- userId, leagueId, totalScore
- Unique constraint: one membership per user per league

**Round** (Competition unit)
- leagueId, roundNumber, theme, description
- Timestamps: submissionStart, submissionEnd, votingStart, votingEnd
- Status: SUBMISSION → VOTING → COMPLETED
- playlistId/playlistUrl: Spotify playlist (admin's account)

**Submission** (User's track entry)
- roundId, userId, spotifyTrackId, trackName, artistName
- albumArt, previewUrl (Spotify metadata)
- totalPoints (calculated after voting)

**Vote** (Score assignment)
- roundId, submissionId, userId, points (1-5)
- Unique constraint: one vote per user per submission per round

## API Layer (tRPC)

### Router Structure

```
rootRouter
├── leagueRouter
│   ├── create (mutation, protected)
│   ├── getBySlug (query, public)
│   ├── getMyLeagues (query, protected)
│   ├── join (mutation, protected)
│   └── getLeaderboard (query, public)
├── roundRouter
│   ├── create (mutation, protected, admin only)
│   ├── getByLeague (query, public)
│   ├── getById (query, public)
│   └── updateStatus (mutation, protected, admin only)
├── submissionRouter
│   ├── submit (mutation, protected)
│   ├── getMySubmission (query, protected)
│   └── getByRound (query, protected, masks user until completed)
└── voteRouter
    ├── castVote (mutation, protected)
    ├── getMyVotes (query, protected)
    └── finalizeRound (mutation, protected, admin only)
```

### Authorization Patterns

1. **Public Procedures:** Read-only, no auth required
2. **Protected Procedures:** Require valid session (`protectedProcedure`)
3. **Admin Procedures:** Protected + verify `league.adminId === ctx.session.user.id`

### Validation

All inputs validated with Zod schemas:
- String fields: `z.string().min(1)`
- Points: `z.number().min(1).max(5)`
- IDs: `z.string()` (cuid format)

## Authentication

**Provider:** Spotify OAuth via NextAuth.js v5

**Flow:**
1. User clicks "Sign in with Spotify"
2. Redirect to Spotify authorization
3. Callback to `/api/auth/callback/spotify`
4. PrismaAdapter stores Account (tokens) + User in DB
5. JWT callback captures access_token, refresh_token
6. Session callback enriches user object

**Session Shape:**
```typescript
{
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    accessToken: string;   // Spotify token
    refreshToken: string;  // For token refresh
  }
}
```

**Token Refresh:**
- `src/server/spotify.ts::refreshAdminToken()` handles expired tokens
- Updates Account.access_token in database

## External Integrations

### Spotify Web API

**Usage:**
- Create private playlist per round (admin's account)
- Add submitted tracks to playlist
- Fetch track metadata (albumArt, previewUrl)

**Auth:** Bearer token from admin's stored refresh_token

**Files:** `src/server/spotify.ts`

### Discord Webhooks (Optional)

**Usage:**
- Notify league members when rounds start/end
- Post voting reminders

**Status:** Helper functions defined but not integrated into procedures

**Files:** `src/server/discord.ts`

## Cross-Cutting Concerns

### Error Handling

- **tRPC:** Error formatter flattens Zod errors (line 31-40 in trpc.ts)
- **Issues:** Uses generic `Error()` not `TRPCError()` with codes
- **Missing:** Global error boundary, client error recovery

### Caching

- **React Query:** Default stale-while-revalidate
- **No explicit invalidation:** Manual refetches needed after mutations
- **Server:** React `cache()` wrapper on auth helpers

### Type Safety

- End-to-end via tRPC RouterInputs/RouterOutputs
- Prisma generates types from schema
- Zod provides runtime validation

## Component Architecture

```
_app.tsx (providers)
├── SessionProvider (NextAuth)
└── api.withTRPC() (tRPC client)
    └── Component (page)
        ├── pages/index.tsx
        │   └── SeasonLeaderboard
        │       └── ui/Table, ui/Avatar, ui/Card
        └── pages/league/[slug].tsx
            └── SeasonLeaderboard
                └── ui/Table, ui/Avatar, ui/Card
```

### UI Components (Shadcn)

- `ui/avatar.tsx` - User profile images
- `ui/button.tsx` - Action buttons
- `ui/card.tsx` - Content containers
- `ui/table.tsx` - Data tables

### Feature Components

- `SeasonLeaderboard.tsx` - Responsive leaderboard (table on desktop, cards on mobile)

## Known Limitations

1. **No pagination** - All queries fetch full result sets
2. **No optimistic updates** - Mutations wait for server response
3. **No offline support** - No service worker or local storage
4. **Vote tallying not atomic** - Potential race conditions
5. **Tight Spotify coupling** - Submissions require valid Spotify tracks

## File Reference

| Path | Purpose |
|------|---------|
| `src/server/api/trpc.ts` | tRPC context, middleware, procedure builders |
| `src/server/api/root.ts` | Router composition |
| `src/server/api/routers/*.ts` | Domain-specific procedures |
| `src/server/auth/config.ts` | NextAuth configuration |
| `src/server/db.ts` | Prisma client singleton |
| `src/utils/api.ts` | tRPC client with React Query |
| `src/env.js` | Environment variable validation |
| `prisma/schema.prisma` | Database schema |
