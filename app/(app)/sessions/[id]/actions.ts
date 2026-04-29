"use server"

import { db } from "@/lib/db"
import {
  getDateStringInTimeZone,
  getUtcStartOfLocalDate,
  isSameLocalDate,
} from "@/lib/local-date"
import { getUser } from "@/lib/user"
import { revalidatePath } from "next/cache"

function hasMeaningfulNoteContent(note: string) {
  const text = note
    .replace(/<img\b[^>]*>/gi, " image ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim()

  return text.length > 0
}

export async function completeSession({
  sessionId,
  noteMarkdown,
  keyTakeaways,
  confusions,
  struggled,
  publishable,
}: {
  sessionId: string
  noteMarkdown: string
  keyTakeaways: string
  confusions: string
  struggled: boolean
  publishable: boolean
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

  const hasNoteContent = hasMeaningfulNoteContent(noteMarkdown)

  if (hasNoteContent) {
    const existingNoteId = session.notes[0]?.id
    if (existingNoteId) {
      await db.note.update({
        where: { id: existingNoteId },
        data: { bodyMarkdown: noteMarkdown, publishable },
      })
    } else {
      await db.note.create({
        data: {
          sessionId,
          bodyMarkdown: noteMarkdown,
          title: session.roadmapItem?.title,
          publishable,
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
      artifactCreated: hasNoteContent && noteMarkdown.trim().length > 50,
    },
  })

  if (session.roadmapItemId) {
    const nextReviewAt = new Date()
    nextReviewAt.setDate(nextReviewAt.getDate() + (struggled ? 1 : 7))
    const completedOnScheduledDay =
      session.roadmapItem?.scheduledDate &&
      isSameLocalDate(
        session.roadmapItem.scheduledDate,
        session.startedAt,
        user.timezone
      )
    const sessionDateString = getDateStringInTimeZone(
      session.startedAt,
      user.timezone
    )

    await db.roadmapItem.update({
      where: { id: session.roadmapItemId },
      data: {
        status: "COMPLETED",
        scheduledDate: completedOnScheduledDay
          ? undefined
          : getUtcStartOfLocalDate(sessionDateString, user.timezone),
        struggled,
        lastReviewedAt: endedAt,
        nextReviewAt: struggled ? nextReviewAt : undefined,
        reviewIntervalDays: struggled ? 1 : 7,
      },
    })
  }

  revalidatePath("/today")
  revalidatePath("/metrics")
  revalidatePath("/notes")
  revalidatePath("/publish")
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
