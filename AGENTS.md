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
- RecSys mini-implementation projects for matrix factorization, BPR, two-tower retrieval, ranking, and offline evaluation
- Paper and roadmap tracking
- Clickable roadmap detail pages with accomplishment summaries and unit breakdowns
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
6. Splits combined math/C++ rows like `Stat 110 lecture 29 + learncpp ch 12.1-12.4` into separate roadmap items.
7. Keeps only light learncpp maintenance during the 14-week Netflix ramp and removes stale unstarted C++ rows.
8. Adds hands-on RecSys mini-implementation and synthesis blocks throughout the schedule.
9. Creates or updates scheduled roadmap items.

The current LeetCode plan is a shuffled medium-hard Python set, not NeetCode 150. It is designed for someone who has already solved many problems and wants to rebuild speed in Python.

Each `RoadmapItem` should belong to one conceptual roadmap. Do not combine learncpp chapters into math roadmap rows; keep C++ reading under `learncpp.com`. Keep C++ light until the Netflix ramp ends around August 3; RecSys, ML projects, LeetCode, reviews, and publishable artifacts should dominate.

## Curriculum Planning Rules

The curriculum should not feel like a passive beginner course. Favor implementation, paper exposure, and synthesis earlier than a traditional slow ramp:

- Start RecSys papers early with targeted skims before full reads. A skim should have a strict timebox and a concrete note objective.
- Pair papers with notebooks quickly. For example, Koren matrix factorization should connect to the toy MF notebook within the same week.
- Prefer small runnable artifacts over vague study blocks: notebooks, toy models, metrics functions, diagrams, or publishable notes.
- Keep early RecSys work hands-on. Matrix factorization should appear in week 1, BPR concepts in week 3 or earlier, and later work should build toward two-tower retrieval, ranking, offline evaluation, and system-level synthesis.
- Use stretch blocks when the schedule feels too slow: paper skim, mini experiment, harder LeetCode, or paper-to-implementation comparison. Keep them bounded so the daily plan remains executable.
- Preserve fundamentals, but make them serve the projects. Math and probability items should help explain embeddings, losses, ranking objectives, metrics, or sampling.

## Roadmap Item Instruction Quality

Avoid incomplete UI instructions. A task title alone is not enough for `PROJECT`, `PAPER`, or `REVIEW` items.

Every custom `PROJECT`, `PAPER`, or `REVIEW` seed item should include a `description` unless the default generated brief is genuinely sufficient. Good descriptions answer:

- What should be produced?
- What are the concrete steps or reading scope?
- What is explicitly out of scope?
- What does “done” mean?
- How does this connect to the surrounding curriculum?

`prisma/seed.ts` has `defaultItemDescription()` as a safety net for project, paper, and review items without custom descriptions. Treat that as a fallback, not the target quality bar. If adding an important item, write a specific description.

The Today and session UIs show `RoadmapItem.description`. They also warn when a `PROJECT`, `PAPER`, or `REVIEW` item has no brief. Do not remove that warning without replacing it with an equal or stronger guardrail.

## Main Routes

- `/today` - daily schedule, resource links, progress, start session actions
- `/sessions/[id]` - timer, embedded resource preview, notes editor, completion checklist
- `/leetcode` - advanced Python LeetCode plan grouped by topic
- `/papers` - paper and ML reading queue
- `/roadmaps` - active roadmap progress
- `/roadmaps/[id]` - roadmap summary, outcomes, progress, and unit breakdown
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
- Added clickable roadmap detail pages with unit breakdowns.
- Linked and deployed the app to Vercel production.
