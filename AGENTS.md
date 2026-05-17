# Spielnova Website — Agent Memory

## Repository
- **GitHub:** https://github.com/ahmedadoha/Web_Spielnova_01
- **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Supabase, Stripe

## Git & GitHub Workflow (IMPORTANT)
- **NEVER commit or push directly to `main`.**
- All changes must go through a **feature branch + Pull Request**:
  1. Create a branch with a descriptive name (e.g. `fix/19-30-slot-boundary`)
  2. Commit changes to that branch
  3. Push the branch and open a PR using the `create_pr` tool
  4. Let the user review and merge on GitHub
- The `GITHUB_TOKEN` is stored in `~/.bashrc` and `~/.git-credentials` for authentication.

## Business Rules
- Opening hours: Mon–Fri 14:00–20:00, Sat 10:00–20:00, Sun closed
- School holidays & public holidays: 10:00–20:00
- Last bookable start slot: 19:30 (ends at 20:00 = closing time)
- 30-min session at 19:30 → allowed (ends exactly at 20:00)
- 60-min session at 19:30 → NOT allowed (would end at 20:30, past closing)
- Total arenas: 2 (max 4 players per arena, max 8 players total)

## Key Files
- `lib/availability.ts` — slot generation & availability logic
- `lib/games.ts` — game catalogue
- `lib/constants.ts` — pricing, arena capacity
- `app/buchen/page.tsx` — booking UI (multi-step form)
- `app/api/availability/route.ts` — availability API endpoint
- `app/api/bookings/route.ts` — booking creation API
