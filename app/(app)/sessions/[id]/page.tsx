import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getUser } from "@/lib/user"
import { SessionEditor } from "./session-editor"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()

  const session = await db.studySession.findFirst({
    where: { id, userId: user.id },
    include: {
      roadmapItem: {
        include: { roadmap: { select: { title: true, domain: true } } },
      },
      notes: true,
    },
  })

  if (!session) notFound()

  const continuationNote =
    !session.notes.length && session.roadmapItem
      ? await db.note.findFirst({
          where: {
            bodyMarkdown: { not: "" },
            session: {
              is: {
                userId: user.id,
                id: { not: session.id },
                roadmapItem: {
                  roadmapId: session.roadmapItem.roadmapId,
                },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            title: true,
            bodyMarkdown: true,
            updatedAt: true,
            session: {
              select: {
                roadmapItem: {
                  select: { title: true },
                },
              },
            },
          },
        })
      : null

  return <SessionEditor session={session} continuationNote={continuationNote} />
}
