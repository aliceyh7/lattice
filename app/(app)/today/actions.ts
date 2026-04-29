"use server"

import { db } from "@/lib/db"
import {
  addDaysToDateString,
  getDateStringInTimeZone,
  getUtcStartOfLocalDate,
} from "@/lib/local-date"
import { getUser } from "@/lib/user"
import { revalidatePath } from "next/cache"

export async function updateItemStatus(
  itemId: string,
  status: "TODO" | "SKIPPED" | "DEFERRED"
) {
  const user = await getUser()

  const item = await db.roadmapItem.findFirst({
    where: { id: itemId, roadmap: { userId: user.id } },
  })
  if (!item) throw new Error("Item not found")

  if (!["TODO", "SKIPPED", "DEFERRED"].includes(status)) {
    throw new Error("Unsupported Today status update")
  }

  if (status === "DEFERRED") {
    const currentDateString = item.scheduledDate
      ? getDateStringInTimeZone(item.scheduledDate, user.timezone)
      : getDateStringInTimeZone(new Date(), user.timezone)
    const nextDateString = addDaysToDateString(currentDateString, 1)

    await db.roadmapItem.update({
      where: { id: itemId },
      data: {
        scheduledDate: getUtcStartOfLocalDate(nextDateString, user.timezone),
        status: "TODO",
      },
    })
  } else {
    await db.roadmapItem.update({
      where: { id: itemId },
      data: { status },
    })
  }

  revalidatePath("/today")
  revalidatePath(`/today?date=${getDateStringInTimeZone(new Date(), user.timezone)}`)
}

export async function startSession(itemId: string): Promise<string> {
  const user = await getUser()

  const item = await db.roadmapItem.findFirst({
    where: { id: itemId, roadmap: { userId: user.id } },
  })
  if (!item) throw new Error("Item not found")

  await db.roadmapItem.update({
    where: { id: itemId },
    data: { status: "IN_PROGRESS" },
  })

  const session = await db.studySession.create({
    data: {
      userId: user.id,
      roadmapItemId: itemId,
    },
  })

  revalidatePath("/today")
  return session.id
}

export async function updateDailyNote(noteId: string, bodyMarkdown: string) {
  const user = await getUser()

  const note = await db.note.findFirst({
    where: {
      id: noteId,
      session: { userId: user.id },
    },
  })
  if (!note) throw new Error("Note not found")

  await db.note.update({
    where: { id: noteId },
    data: { bodyMarkdown },
  })

  revalidatePath("/today")
  revalidatePath("/publish")
}
