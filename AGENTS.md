# Lattice Agent Guide

<!-- BEGIN:nextjs-agent-rules -->
## Next.js Version Note

This is a Next.js 16 project. APIs, conventions, and file structure may differ from older Next.js versions. Read relevant local docs in `node_modules/next/dist/docs/` before changing framework-level behavior.
<!-- END:nextjs-agent-rules -->

## Project Summary

Lattice is a personal curriculum and learning dashboard built with Next.js App Router, Prisma, and PostgreSQL. It tracks daily roadmap items, study sessions, notes, spaced review signals, LeetCode practice, papers, and publishable learning artifacts.

The current product focus is:

- Daily execution from `/today`
- Session notes with a visible timer and embedded resource previews
- Advanced Python-focused LeetCode practice
- Paper and roadmap tracking
- LLM-assisted publishing drafts for X threads and Medium-style posts

## Stack

- Next.js 16 App Router
- React 19
- Prisma 7 with PostgreSQL via `@prisma/adapter-pg`
- Tailwind CSS 4
- shadcn/base-ui style local components in `components/ui`
- OpenAI Responses API for publish draft generation
- Vercel production deployment

## Key Commands

```bash
npm run dev
npm run build
npm run db:generate
npm run db:push
npm run db:seed
```

Run `npm run build` before committing UI/API changes. The build currently emits a PostgreSQL SSL warning from dependencies/config, but it does not fail the build.

## Environment Variables

Required:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/lattice?schema=public"
```

For publish draft generation:

```bash
OPENAI_API_KEY="sk-proj-..."
OPENAI_PUBLISH_MODEL="gpt-5.4-mini"
```

`OPENAI_PUBLISH_MODEL` is optional. If unset, the API route defaults to `gpt-5.4-mini`.

Do not expose `OPENAI_API_KEY` to client components. LLM calls should stay server-side.

## Data Model

Primary relationships:

```text
User
  has many Roadmaps

Roadmap
  has many RoadmapItems

RoadmapItem
  has many StudySessions
  has many QuizCards

StudySession
  has many Notes

Note
  can be marked publishable
```

Important models live in `prisma/schema.prisma`:

- `User`
- `Roadmap`
- `RoadmapItem`
- `StudySession`
- `Note`
- `QuizCard`

## Seed Behavior

Seed data lives in `prisma/seed.ts`.

`npm run db:seed`:

1. Upserts the default user.
2. Creates or updates roadmap definitions.
3. Reuses the existing LeetCode roadmap by domain.
4. Renames/replaces it with `Advanced Python LeetCode`.
5. Deletes stale LeetCode items not in the current advanced plan.
6. Creates or updates scheduled roadmap items.

The current LeetCode plan is a shuffled medium-hard Python set, not NeetCode 150. It is designed for someone who has already solved many problems and wants to rebuild speed in Python.

## Main Routes

- `/today` - daily schedule, resource links, progress, start session actions
- `/sessions/[id]` - timer, embedded resource preview, notes editor, completion checklist
- `/leetcode` - advanced Python LeetCode plan grouped by topic
- `/papers` - paper and ML reading queue
- `/roadmaps` - active roadmap progress
- `/notes` - recent saved notes
- `/publish` - choose a note, generate X thread or Medium draft, edit/copy output
- `/api/publish-draft` - server-only OpenAI Responses API route

## Publish Flow

Current flow:

```text
/today
  -> Start a session
  -> Write notes
  -> Complete session
  -> Optionally keep "Add this note to the publish queue" checked
  -> /publish
  -> Select note
  -> Choose X thread or Medium
  -> Generate draft
  -> Edit and copy
```

Implementation details:

- Session completion sets `Note.publishable`.
- `/publish` lists recent notes, prioritizing publishable ones.
- `app/api/publish-draft/route.ts` fetches the note for the current user and calls OpenAI from the server.
- The browser never sees the API key.

## Resource Preview Flow

Resource helpers live in:

- `lib/resources.ts`
- `components/resource-preview.tsx`

YouTube watch, short, embed, and playlist URLs are converted into embeddable iframe URLs. Non-YouTube resources render as clean external resource cards.

## Deployment

The repo is linked to Vercel project:

```text
aliceyh7-1539s-projects/lattice
```

Latest production alias after CLI deploy:

```text
https://lattice-five.vercel.app
```

CLI deployment:

```bash
npx vercel deploy --prod
```

GitHub remote:

```text
https://github.com/aliceyh7/lattice.git
```

Pushing to `main` may also trigger Vercel Git integration if enabled.

## Coding Notes

- Prefer existing components in `components/ui`.
- Keep LLM, database, and auth-sensitive work in server routes or server actions.
- Use server actions for mutations tied to app workflows.
- Keep client components focused on interaction state, fetch calls, and display.
- Do not commit `.env`, `.vercel`, `.next`, or generated Prisma output.
- Filter app-facing roadmap queries by `status: "ACTIVE"` when stale archived plans would be confusing.

## Recent Changes

- Added embedded YouTube/resource previews for session pages.
- Added missing `/leetcode`, `/papers`, and `/publish` pages.
- Replaced LeetCode roadmap with `Advanced Python LeetCode`.
- Added publish draft generation for X threads and Medium posts.
- Added `/api/publish-draft` server route using OpenAI Responses API.
- Linked and deployed the app to Vercel production.
