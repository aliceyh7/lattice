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

  return <SessionEditor session={session} />
}
