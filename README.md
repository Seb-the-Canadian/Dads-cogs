# Dads-cogs 🎵

A Music League clone built with the T3 Stack. Share music, vote on tracks, and compete with friends throughout a season.

## Features

- **F1 Season Structure**: Users belong to Leagues (Seasons) with multiple Rounds
- **Blind Voting**: Submissions are anonymous until voting ends
- **Admin Bot**: Auto-generates Spotify playlists using the admin's account
- **Discord Integration**: Webhooks notify when rounds start/end
- **Mobile-First PWA**: Optimized for mobile with offline support
- **Season Leaderboard**: Track cumulative scores across all rounds

## Tech Stack

- **Framework**: Next.js (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: PostgreSQL via Prisma
- **Auth**: NextAuth.js with Spotify OAuth
- **API**: tRPC for type-safe APIs
- **External APIs**: Spotify Web API

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Spotify Developer Account

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Spotify OAuth

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/callback/spotify`
4. Copy the Client ID and Client Secret

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
# NextAuth
AUTH_SECRET="run: npx auth secret"

# Spotify OAuth
SPOTIFY_CLIENT_ID="your_spotify_client_id"
SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dadscogs"
```

Generate an auth secret:

```bash
npx auth secret
```

### 4. Set Up Database

Push the Prisma schema to your database:

```bash
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Core Workflows

### Creating a League (Season)

1. Sign in with Spotify
2. Click "Create League"
3. Set league name and optional Discord webhook URL
4. Share the league slug with friends to join

### Running a Round

**As Admin:**

1. Create a new round with theme and dates
2. System auto-generates a Spotify playlist on your account
3. Discord webhook notifies members

**As Participant:**

1. Submit a Spotify track during submission period
2. Vote on anonymous submissions during voting period (1-5 points)
3. See results when round completes

### The Admin Bot

The league admin authenticates with Spotify. When creating rounds:

- The system uses the admin's refresh token
- Creates a private playlist on the admin's Spotify account
- Adds all submissions to maintain anonymity
- No one knows who submitted what until voting ends

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   └── SeasonLeaderboard.tsx
├── lib/                # Utilities
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   ├── league/         # League pages
│   └── index.tsx       # Home page
├── server/             # Server-side code
│   ├── api/            # tRPC routers
│   │   ├── routers/    # API route handlers
│   │   ├── root.ts     # Root router
│   │   └── trpc.ts     # tRPC setup
│   ├── auth/           # NextAuth config
│   ├── db.ts           # Prisma client
│   ├── discord.ts      # Discord webhooks
│   └── spotify.ts      # Spotify API helpers
└── styles/             # Global styles

prisma/
└── schema.prisma       # Database schema

public/
└── manifest.json       # PWA manifest
```

## Database Schema

Key models:

- **User**: Auth and profile
- **League**: Season container
- **LeagueMember**: User participation + total score
- **Round**: Individual competition round
- **Submission**: User's track submission
- **Vote**: User's vote on a submission

See [prisma/schema.prisma](prisma/schema.prisma) for full schema.

## API Routes (tRPC)

### League
- `league.create` - Create new league
- `league.getBySlug` - Get league details
- `league.getMyLeagues` - Get user's leagues
- `league.join` - Join league by slug
- `league.getLeaderboard` - Get season standings

### Round
- `round.create` - Create new round (admin only)
- `round.getByLeague` - Get rounds for league
- `round.getById` - Get round details
- `round.updateStatus` - Update round status (admin only)

### Submission
- `submission.submit` - Submit track for round
- `submission.getMySubmission` - Get user's submission
- `submission.getByRound` - Get all submissions (anonymous until complete)

### Vote
- `vote.castVote` - Cast vote for submission
- `vote.getMyVotes` - Get user's votes for round
- `vote.finalizeRound` - Complete round and update scores (admin only)

## Deployment

### Database

Set up a PostgreSQL database on your preferred provider:
- Railway
- Supabase
- Neon
- PlanetScale (MySQL alternative)

Update `DATABASE_URL` in production environment.

### Hosting

Deploy to Vercel:

```bash
vercel deploy
```

Update Spotify OAuth redirect URI to include your production domain.

### Environment Variables

Set all environment variables in your hosting platform:
- `AUTH_SECRET`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `DATABASE_URL`

## Contributing

This is a personal project, but feel free to fork and customize for your group!

## License

MIT
