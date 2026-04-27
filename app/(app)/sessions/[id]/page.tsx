import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { SessionEditor } from "./session-editor"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/onboard")

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
