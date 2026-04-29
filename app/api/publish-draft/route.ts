import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { getLocalDateRange } from "@/lib/local-date"
import { noteToPlainText } from "@/lib/note-content"
import { getUser } from "@/lib/user"

export const runtime = "nodejs"

const requestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  format: z.enum(["x-thread", "medium"]),
})

type OpenAIResponse = {
  output_text?: string
  output?: Array<{
    content?: Array<{
      type?: string
      text?: string
    }>
  }>
  error?: {
    message?: string
  }
}

export async function POST(request: Request) {
  const user = await getUser()
  const parsed = requestSchema.safeParse(await request.json())

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { start, end } = getLocalDateRange(parsed.data.date, user.timezone)
  const notes = await db.note.findMany({
    where: {
      bodyMarkdown: { not: "" },
      session: {
        userId: user.id,
        startedAt: {
          gte: start,
          lt: end,
        },
      },
    },
    include: {
      session: {
        include: {
          roadmapItem: {
            include: { roadmap: { select: { title: true, domain: true } } },
          },
        },
      },
    },
    orderBy: [{ session: { startedAt: "asc" } }, { createdAt: "asc" }],
  })

  if (notes.length === 0) {
    return NextResponse.json({ error: "No notes found for that day" }, { status: 404 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY on the server" },
      { status: 500 }
    )
  }

  const format = parsed.data.format
  const model = process.env.OPENAI_PUBLISH_MODEL || "gpt-5.4-mini"
  const draftPrompt = buildPrompt({
    format,
    date: parsed.data.date,
    notes: notes.map((note) => {
      const item = note.session?.roadmapItem
      return {
        title: note.title || item?.title || "Untitled note",
        roadmap: item?.roadmap.title || "Learning notes",
        sourceUrl: note.sourceUrl || item?.url || null,
        keyTakeaways: note.session?.keyTakeaways || null,
        confusions: note.session?.confusions || null,
        bodyMarkdown: note.bodyMarkdown,
      }
    }),
  })

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "low" },
      input: [
        {
          role: "developer",
          content:
            "You turn raw study notes into clear publishable drafts. Preserve the author's claims, avoid inventing facts, and keep a practical learning-in-public voice.",
        },
        {
          role: "user",
          content: draftPrompt,
        },
      ],
      max_output_tokens: format === "medium" ? 3600 : 1800,
    }),
  })

  const data = (await response.json()) as OpenAIResponse

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error?.message || "Unable to generate draft" },
      { status: response.status }
    )
  }

  const draft = extractOutputText(data)
  if (!draft) {
    return NextResponse.json(
      { error: "The model returned an empty draft" },
      { status: 502 }
    )
  }

  return NextResponse.json({ draft, model })
}

function buildPrompt({
  format,
  date,
  notes,
}: {
  format: "x-thread" | "medium"
  date: string
  notes: Array<{
    title: string
    roadmap: string
    sourceUrl: string | null
    keyTakeaways: string | null
    confusions: string | null
    bodyMarkdown: string
  }>
}) {
  const target =
    format === "x-thread"
      ? [
          "Create an X reply chain from all notes for this day.",
          "Use 5-10 posts total, where each post is meant to be posted as a reply to the previous post.",
          "Number each post like 1/8.",
          "Keep every post under 260 characters.",
          "Make the first post a strong hook.",
          "Synthesize across the day's notes instead of making one disconnected mini-thread per note.",
          "End with one practical takeaway.",
        ].join("\n")
      : [
          "Create one Medium-style blog draft from all notes for this day.",
          "Do not create separate posts per note.",
          "Include a title, subtitle, short intro, 4-6 sections, and a concise takeaway.",
          "Use Markdown headings.",
          "Synthesize the notes into one coherent learning narrative while preserving concrete details.",
        ].join("\n")

  return [
    target,
    "",
    "Context:",
    `Date: ${date}`,
    `Notes included: ${notes.length}`,
    "",
    "Raw notes:",
    ...notes.flatMap((note, index) => [
      "",
      `Note ${index + 1}: ${note.title}`,
      `Roadmap: ${note.roadmap}`,
      note.sourceUrl ? `Source URL: ${note.sourceUrl}` : null,
      note.keyTakeaways ? `Key takeaways: ${note.keyTakeaways}` : null,
      note.confusions ? `Open questions/confusions: ${note.confusions}` : null,
      noteToPlainText(note.bodyMarkdown),
    ]),
  ]
    .filter(Boolean)
    .join("\n")
}

function extractOutputText(data: OpenAIResponse) {
  if (data.output_text) return data.output_text.trim()

  return (
    data.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n")
      .trim() || ""
  )
}
