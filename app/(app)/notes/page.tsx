import { db } from "@/lib/db"
import { getUser } from "@/lib/user"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { noteToPlainText } from "@/lib/note-content"
import { format } from "date-fns"
import { FileText } from "lucide-react"

export default async function NotesPage() {
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
            include: { roadmap: { select: { title: true, domain: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notes</h1>
        <p className="text-sm text-muted-foreground mt-1">{notes.length} notes</p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p>No notes yet. Complete a study session to create your first note.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {note.title || note.session?.roadmapItem?.title || "Untitled note"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {noteToPlainText(note.bodyMarkdown).slice(0, 120)}…
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(note.createdAt), "MMM d")}
                    </p>
                  </div>
                </div>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
