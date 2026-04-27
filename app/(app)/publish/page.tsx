import { db } from "@/lib/db"
import { getUser } from "@/lib/user"
import { PublishClient } from "./publish-client"

const CHANNELS = [
  {
    name: "Medium",
    handle: "@alice.yh7",
    url: "https://medium.com/@alice.yh7",
    description: "Long-form notes, paper summaries, and learning reflections",
    icon: "M",
  },
  {
    name: "X / Twitter",
    handle: "@hu_yh7",
    url: "https://x.com/hu_yh7",
    description: "Daily progress, quick insights, and study streaks",
    icon: "X",
  },
]

export default async function PublishPage() {
  const user = await getUser()

  const notes = await db.note.findMany({
    where: {
      session: { userId: user.id },
      bodyMarkdown: { not: "" },
    },
    include: {
      session: {
        include: {
          roadmapItem: {
            include: { roadmap: { select: { title: true } } },
          },
        },
      },
    },
    orderBy: [{ publishable: "desc" }, { createdAt: "desc" }],
    take: 30,
  })

  const publishableCount = notes.filter((note) => note.publishable).length
  const clientNotes = notes.map((note) => ({
    id: note.id,
    title: note.title || note.session?.roadmapItem?.title || "Untitled note",
    bodyMarkdown: note.bodyMarkdown,
    publishable: note.publishable,
    createdAt: note.createdAt.toISOString(),
    roadmapTitle: note.session?.roadmapItem?.roadmap.title || null,
    itemTitle: note.session?.roadmapItem?.title || null,
  }))

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Publish</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share your learning — {publishableCount} note{publishableCount !== 1 ? "s" : ""} in the queue
          of {notes.length} recent note{notes.length !== 1 ? "s" : ""}
        </p>
      </div>
      <PublishClient notes={clientNotes} channels={CHANNELS} />
    </div>
  )
}
