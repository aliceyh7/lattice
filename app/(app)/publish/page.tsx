import { db } from "@/lib/db"
import { getUser } from "@/lib/user"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, ExternalLink } from "lucide-react"
import { format } from "date-fns"

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

  const publishableNotes = await db.note.findMany({
    where: {
      session: { userId: user.id },
      publishable: true,
      bodyMarkdown: { not: "" },
    },
    include: {
      session: {
        include: {
          roadmapItem: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const allNotes = await db.note.findMany({
    where: {
      session: { userId: user.id },
      bodyMarkdown: { not: "" },
    },
    select: { id: true },
  })

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Publish</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share your learning — {publishableNotes.length} note{publishableNotes.length !== 1 ? "s" : ""} marked publishable
          of {allNotes.length} total
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CHANNELS.map((ch) => (
          <a
            key={ch.name}
            href={ch.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="h-full transition-colors group-hover:border-foreground/30">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-foreground text-background flex items-center justify-center text-sm font-bold shrink-0">
                  {ch.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold">{ch.name}</p>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">{ch.handle}</p>
                  <p className="text-xs text-muted-foreground mt-1">{ch.description}</p>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Publishable notes</h2>
        {publishableNotes.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
            <FileText className="h-6 w-6 mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              No publishable notes yet. Mark notes as publishable when completing sessions.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {publishableNotes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-3">
                  <p className="text-sm font-medium">
                    {note.title || note.session?.roadmapItem?.title || "Untitled"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {note.bodyMarkdown.slice(0, 140)}…
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {format(new Date(note.createdAt), "MMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
