import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { getUser } from "@/lib/user"

export const runtime = "nodejs"

const requestSchema = z.object({
  noteId: z.string().min(1),
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

  const note = await db.note.findFirst({
    where: {
      id: parsed.data.noteId,
      session: { userId: user.id },
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
  })

  if (!note || !note.bodyMarkdown.trim()) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 })
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
  const item = note.session?.roadmapItem
  const draftPrompt = buildPrompt({
    format,
    title: note.title || item?.title || "Untitled note",
    roadmap: item?.roadmap.title || "Learning notes",
    sourceUrl: note.sourceUrl || item?.url || null,
    keyTakeaways: note.session?.keyTakeaways || null,
    confusions: note.session?.confusions || null,
    bodyMarkdown: note.bodyMarkdown,
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
      max_output_tokens: format === "medium" ? 2600 : 1200,
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
  title,
  roadmap,
  sourceUrl,
  keyTakeaways,
  confusions,
  bodyMarkdown,
}: {
  format: "x-thread" | "medium"
  title: string
  roadmap: string
  sourceUrl: string | null
  keyTakeaways: string | null
  confusions: string | null
  bodyMarkdown: string
}) {
  const target =
    format === "x-thread"
      ? [
          "Create an X thread.",
          "Use 5-8 posts.",
          "Number each post like 1/7.",
          "Keep every post under 260 characters.",
          "Make the first post a strong hook.",
          "End with one practical takeaway.",
        ].join("\n")
      : [
          "Create a Medium-style blog draft.",
          "Include a title, subtitle, short intro, 3-5 sections, and a concise takeaway.",
          "Use Markdown headings.",
          "Keep it specific and grounded in the note.",
        ].join("\n")

  return [
    target,
    "",
    "Context:",
    `Title: ${title}`,
    `Roadmap: ${roadmap}`,
    sourceUrl ? `Source URL: ${sourceUrl}` : null,
    keyTakeaways ? `Key takeaways: ${keyTakeaways}` : null,
    confusions ? `Open questions/confusions: ${confusions}` : null,
    "",
    "Raw note:",
    bodyMarkdown,
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
