"use server"

import { db } from "@/lib/db"
import { getUser } from "@/lib/user"
import { revalidatePath } from "next/cache"

export async function completeSession({
  sessionId,
  noteMarkdown,
  keyTakeaways,
  confusions,
  struggled,
}: {
  sessionId: string
  noteMarkdown: string
  keyTakeaways: string
  confusions: string
  struggled: boolean
}) {
  const user = await getUser()
  const session = await db.studySession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: { roadmapItem: true, notes: { take: 1 } },
  })
  if (!session) throw new Error("Session not found")

  const endedAt = new Date()
  const actualMinutes = Math.ceil(
    (endedAt.getTime() - session.startedAt.getTime()) / 60000
  )

  if (noteMarkdown.trim()) {
    const existingNoteId = session.notes[0]?.id
    if (existingNoteId) {
      await db.note.update({
        where: { id: existingNoteId },
        data: { bodyMarkdown: noteMarkdown },
      })
    } else {
      await db.note.create({
        data: {
          sessionId,
          bodyMarkdown: noteMarkdown,
          title: session.roadmapItem?.title,
        },
      })
    }
  }

  await db.studySession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      endedAt,
      actualMinutes,
      keyTakeaways: keyTakeaways || null,
      confusions: confusions || null,
      artifactCreated: noteMarkdown.trim().length > 50,
    },
  })

  if (session.roadmapItemId) {
    const nextReviewAt = new Date()
    nextReviewAt.setDate(nextReviewAt.getDate() + (struggled ? 1 : 7))

    await db.roadmapItem.update({
      where: { id: session.roadmapItemId },
      data: {
        status: "COMPLETED",
        struggled,
        lastReviewedAt: endedAt,
        nextReviewAt: struggled ? nextReviewAt : undefined,
        reviewIntervalDays: struggled ? 1 : 7,
      },
    })
  }

  revalidatePath("/today")
  revalidatePath("/metrics")
}

export async function saveNote({
  sessionId,
  markdown,
}: {
  sessionId: string
  markdown: string
}) {
  const user = await getUser()
  const session = await db.studySession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: { notes: { take: 1 } },
  })
  if (!session) throw new Error("Session not found")

  if (session.notes[0]) {
    await db.note.update({
      where: { id: session.notes[0].id },
      data: { bodyMarkdown: markdown },
    })
  } else {
    await db.note.create({
      data: { sessionId, bodyMarkdown: markdown },
    })
  }
}
