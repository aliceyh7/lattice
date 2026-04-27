# Lattice

Personal curriculum dashboard for structured daily learning, notes, review, LeetCode practice, paper reading, and publishing learning artifacts.

## What It Does

- Shows today's scheduled learning tasks.
- Starts timed study sessions.
- Saves notes, key takeaways, and confusions.
- Embeds YouTube resources directly in session pages.
- Tracks roadmap progress across ML/RecSys, math, systems, papers, and LeetCode.
- Opens each roadmap into a summary page with expected outcomes and unit breakdowns.
- Provides an advanced Python LeetCode plan for medium-hard practice.
- Generates copyable X thread or Medium-style drafts from notes using an LLM.

## Tech Stack

- Next.js 16 App Router
- React 19
- Prisma 7
- PostgreSQL
- Tailwind CSS 4
- Vercel
- OpenAI Responses API for publish drafts

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example` and set at least:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/lattice?schema=public"
```

For publish draft generation, also set:

```bash
OPENAI_API_KEY="sk-proj-..."
OPENAI_PUBLISH_MODEL="gpt-5.4-mini"
```

Generate Prisma client and seed data:

```bash
npm run db:generate
npm run db:seed
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Core Routes

- `/today` - daily task list and session start actions
- `/sessions/[id]` - study timer, notes editor, resource embed, completion flow
- `/leetcode` - advanced Python LeetCode roadmap
- `/papers` - paper and ML reading queue
- `/roadmaps` - roadmap progress cards
- `/roadmaps/[id]` - roadmap detail with accomplishment summary and units
- `/notes` - saved session notes
- `/publish` - generate X or Medium drafts from notes

## Database

The Prisma schema is in `prisma/schema.prisma`.

Main entities:

- `User`
- `Roadmap`
- `RoadmapItem`
- `StudySession`
- `Note`
- `QuizCard`

Seed data is in `prisma/seed.ts`. Running `npm run db:seed` upserts the default user, roadmaps, and scheduled items. The seed currently keeps one active LeetCode roadmap named `Advanced Python LeetCode` and removes stale old LeetCode items from that roadmap.

The seed also splits combined schedule rows such as `Stat 110 lecture 29 + learncpp ch 12.1-12.4` into separate roadmap items so C++ reading stays under `learncpp.com`.

## Publish Drafts

The publish flow is:

```text
Complete session with notes
  -> note is saved
  -> optionally mark it for publish queue
  -> open /publish
  -> choose X thread or Medium
  -> generate draft
  -> edit and copy
```

LLM generation happens in `app/api/publish-draft/route.ts`. The API key is read from `OPENAI_API_KEY` on the server.

## Deployment

Production deployment is on Vercel.

Latest production alias:

```text
https://lattice-five.vercel.app
```

Deploy manually:

```bash
npx vercel deploy --prod
```

The project is linked to:

```text
aliceyh7-1539s-projects/lattice
```

Use Vercel environment variables for production secrets instead of relying on a local `.env` file.
