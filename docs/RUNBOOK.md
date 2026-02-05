# Runbook: Dads-cogs Operations

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Build production | `npm run build` |
| Start production | `npm run start` |
| Type check | `npm run typecheck` |
| Push DB schema | `npm run db:push` |
| Create migration | `npm run db:generate` |
| Deploy migrations | `npm run db:migrate` |
| Open DB GUI | `npm run db:studio` |

---

## Environment Setup

### Required Environment Variables

Create `.env` from template:
```bash
cp .env.example .env
```

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@localhost:5432/dadscogs` | PostgreSQL connection string |
| `SPOTIFY_CLIENT_ID` | Yes | `abc123...` | From Spotify Developer Dashboard |
| `SPOTIFY_CLIENT_SECRET` | Yes | `xyz789...` | Keep secret! |
| `AUTH_SECRET` | Prod | `openssl rand -base64 32` | Generate with `npx auth secret` |

### Spotify OAuth Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create new application
3. Add Redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/spotify`
   - Production: `https://yourdomain.com/api/auth/callback/spotify`
4. Copy Client ID and Client Secret to `.env`

### Database Setup

**Option 1: Local PostgreSQL**
```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15
createdb dadscogs

# Set DATABASE_URL
DATABASE_URL="postgresql://$(whoami)@localhost:5432/dadscogs"
```

**Option 2: Docker**
```bash
docker run -d \
  --name dadscogs-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=dadscogs \
  -p 5432:5432 \
  postgres:15

DATABASE_URL="postgresql://postgres:password@localhost:5432/dadscogs"
```

**Option 3: Hosted (Recommended for production)**
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Supabase](https://supabase.com) - PostgreSQL + extras
- [Railway](https://railway.app) - Simple deployment

---

## Development Workflow

### First-Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values

# 3. Push schema to database
npm run db:push

# 4. Start development
npm run dev
```

### Daily Development

```bash
# Start dev server with Turbopack
npm run dev

# In another terminal, open Prisma Studio
npm run db:studio

# Type check before committing
npm run typecheck
```

### Database Changes

```bash
# After modifying prisma/schema.prisma:

# Development (direct push, no migration history)
npm run db:push

# OR create migration (recommended)
npm run db:generate  # Creates migration file
npm run db:migrate   # Applies migration
```

---

## Production Deployment

### Build Process

```bash
# 1. Install production dependencies
npm ci

# 2. Build application
npm run build

# 3. Run database migrations
npm run db:migrate

# 4. Start server
npm run start
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - SPOTIFY_CLIENT_ID
# - SPOTIFY_CLIENT_SECRET
# - AUTH_SECRET
```

### Environment Variables for Production

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Production PostgreSQL URL |
| `SPOTIFY_CLIENT_ID` | Same as dev |
| `SPOTIFY_CLIENT_SECRET` | Same as dev |
| `AUTH_SECRET` | Generate new: `npx auth secret` |

---

## Troubleshooting

### Common Issues

**1. "Cannot find module '@prisma/client'"**
```bash
npm run postinstall
# or
npx prisma generate
```

**2. "Database connection failed"**
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check firewall/network access

**3. "Spotify OAuth fails"**
- Verify redirect URI matches exactly
- Check Client ID/Secret are correct
- Ensure scopes are configured in Spotify app

**4. "Build fails with env validation"**
```bash
# Skip validation for Docker builds
SKIP_ENV_VALIDATION=true npm run build
```

**5. "Prisma migration failed"**
```bash
# Reset database (DESTROYS DATA)
npx prisma migrate reset

# Or fix manually
npx prisma db push --force-reset
```

### Logs and Debugging

**Development:**
```bash
# tRPC errors logged to console
# Check browser Network tab for API calls
# Prisma queries logged if DEBUG=prisma:query
```

**Production:**
- Check hosting provider logs (Vercel, Railway, etc.)
- No built-in error tracking (add Sentry)

---

## Database Operations

### Backup

```bash
# Export
pg_dump $DATABASE_URL > backup.sql

# Import
psql $DATABASE_URL < backup.sql
```

### Reset (Development Only!)

```bash
# Reset and re-apply migrations
npx prisma migrate reset

# Or drop and recreate
npx prisma db push --force-reset
```

### Inspect Data

```bash
# GUI
npm run db:studio

# CLI
npx prisma db pull  # Show current schema
```

---

## Monitoring Checklist

### Health Checks

| Check | How | Expected |
|-------|-----|----------|
| App responds | `curl https://yourapp.com` | 200 OK |
| Auth works | Sign in with Spotify | Redirect to home |
| DB connected | Create a league | Success |
| Spotify API | Submit a track | Track added |

### Key Metrics to Watch

- [ ] Error rate (needs Sentry setup)
- [ ] Response times
- [ ] Database connection pool
- [ ] Spotify API rate limits

---

## Emergency Procedures

### App Down

1. Check hosting provider status
2. Check database connectivity
3. Review recent deployments
4. Rollback if needed: `vercel rollback`

### Database Corrupted

1. Stop application
2. Restore from backup: `psql $DATABASE_URL < backup.sql`
3. Verify data integrity
4. Restart application

### Spotify Token Issues

If admin tokens stop working:
1. Have admin re-authenticate
2. Check Account table for valid refresh_token
3. Verify Spotify app hasn't been revoked

---

## Security Notes

- Never commit `.env` file
- Rotate `AUTH_SECRET` if compromised
- Revoke Spotify tokens if breached
- Use HTTPS in production
- Keep dependencies updated: `npm audit fix`
