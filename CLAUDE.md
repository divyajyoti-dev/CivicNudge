# CivicNudge

A civic infrastructure tool for NGOs and advocacy groups. Ingests government bills (state, federal, local), scores them against audience profiles using Claude, and generates targeted social media content (Instagram, X, SMS) — no legalese, no jargon.

## Stack
- Next.js 14 (App Router, TypeScript, Tailwind CSS)
- Anthropic SDK (`@anthropic-ai/sdk`) — model: `claude-sonnet-4-6`
- No database in MVP — in-memory mock data

## Environment
- `ANTHROPIC_API_KEY` lives in `.env.local` — never commit this file

## Git Rules
- **Never add Co-Authored-By lines to git commits.** All commits are authored by the human developer only.
- Commit messages should be concise and describe the change, not the author.

## Project Structure
- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — React components
- `src/lib/` — shared types, mock data, utilities
- `src/app/api/analyze/` — Claude API route for bill analysis + content generation
