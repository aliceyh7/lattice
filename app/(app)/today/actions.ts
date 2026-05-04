"use server"

import { db } from "@/lib/db"
import {
  addDaysToDateString,
  getDateStringInTimeZone,
  getUtcStartOfLocalDate,
} from "@/lib/local-date"
import { noteToPlainText } from "@/lib/note-content"
import { getUser } from "@/lib/user"
import { revalidatePath } from "next/cache"
import type { Domain, ItemType } from "@prisma/client"

const DOMAINS = new Set([
  "ML_RECSYS",
  "LEETCODE",
  "MATH_STATS",
  "CPP_SYSTEMS",
  "DISTRIBUTED_TRAINING",
  "REVIEW",
  "OTHER",
])

const ITEM_TYPES = new Set([
  "VIDEO",
  "PAPER",
  "COURSE",
  "PROBLEM",
  "PROJECT",
  "REVIEW",
  "READING",
])

const DEFAULT_ROADMAP_BY_DOMAIN: Record<Domain, string> = {
  ML_RECSYS: "ML / RecSys",
  LEETCODE: "Deep-ML Practice",
  MATH_STATS: "Quant Stats / Probability",
  CPP_SYSTEMS: "C++ / Systems",
  DISTRIBUTED_TRAINING: "Distributed Training",
  REVIEW: "Review / Admin",
  OTHER: "Calendar Blocks",
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function parseTimeToMinutes(value: string) {
  if (!value) return null
  const match = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

function minutesBetween(start: number | null, end: number | null) {
  if (start === null || end === null || end <= start) return 45
  return end - start
}

function parseDomain(value: string): Domain {
  return DOMAINS.has(value) ? (value as Domain) : "OTHER"
}

function parseItemType(value: string): ItemType {
  return ITEM_TYPES.has(value) ? (value as ItemType) : "PROJECT"
}

async function getOrCreateRoadmap(userId: string, domain: Domain) {
  const title = DEFAULT_ROADMAP_BY_DOMAIN[domain]
  const existing = await db.roadmap.findFirst({
    where: { userId, title },
  })
  if (existing) {
    if (existing.status !== "ACTIVE") {
      return db.roadmap.update({
        where: { id: existing.id },
        data: { status: "ACTIVE" },
      })
    }
    return existing
  }

  return db.roadmap.create({
    data: {
      userId,
      title,
      domain,
      description: "Editable calendar tasks for the current curriculum.",
      targetRole: domain === "LEETCODE" ? "Deep-ML / ML interviews" : undefined,
      status: "ACTIVE",
      priority: 100,
    },
  })
}

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

export async function updateDailyNote(
  noteId: string,
  title: string,
  bodyMarkdown: string
) {
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
    data: {
      title: title.trim() || null,
      bodyMarkdown,
    },
  })

  revalidatePath("/today")
  revalidatePath("/publish")
}

export async function deleteDailyNote(noteId: string) {
  const user = await getUser()

  const note = await db.note.findFirst({
    where: {
      id: noteId,
      session: { userId: user.id },
    },
  })
  if (!note) throw new Error("Note not found")

  await db.$transaction([
    db.quizCard.updateMany({
      where: { noteId },
      data: { noteId: null },
    }),
    db.note.delete({ where: { id: noteId } }),
  ])

  revalidatePath("/today")
  revalidatePath("/publish")
}

export async function mergeDailyNote(sourceNoteId: string, targetNoteId: string) {
  if (sourceNoteId === targetNoteId) {
    throw new Error("Choose a different note to merge into")
  }

  const user = await getUser()
  const notes = await db.note.findMany({
    where: {
      id: { in: [sourceNoteId, targetNoteId] },
      session: { userId: user.id },
    },
  })
  const sourceNote = notes.find((note) => note.id === sourceNoteId)
  const targetNote = notes.find((note) => note.id === targetNoteId)
  if (!sourceNote || !targetNote) throw new Error("Note not found")

  const sourceTitle = sourceNote.title?.trim() || "Merged note"
  const targetBody = noteToPlainText(targetNote.bodyMarkdown)
  const sourceBody = noteToPlainText(sourceNote.bodyMarkdown)
  const mergedBody = [
    targetBody,
    sourceBody ? `## ${sourceTitle}\n\n${sourceBody}` : `## ${sourceTitle}`,
  ]
    .filter(Boolean)
    .join("\n\n")

  await db.$transaction([
    db.note.update({
      where: { id: targetNoteId },
      data: { bodyMarkdown: mergedBody },
    }),
    db.quizCard.updateMany({
      where: { noteId: sourceNoteId },
      data: { noteId: targetNoteId },
    }),
    db.note.delete({ where: { id: sourceNoteId } }),
  ])

  revalidatePath("/today")
  revalidatePath("/publish")
}

export async function createCalendarItem(
  selectedDate: string,
  formData: FormData
) {
  const user = await getUser()
  const title = readString(formData, "title")
  if (!title) throw new Error("Title is required")

  const start = parseTimeToMinutes(readString(formData, "startTime"))
  const end = parseTimeToMinutes(readString(formData, "endTime"))
  const domain = parseDomain(readString(formData, "domain"))
  const type = parseItemType(readString(formData, "type"))
  const roadmap = await getOrCreateRoadmap(user.id, domain)
  const scheduledDate = getUtcStartOfLocalDate(selectedDate, user.timezone)
  const sequenceOrder = start ?? 9999

  await db.roadmapItem.create({
    data: {
      roadmapId: roadmap.id,
      title,
      description: readString(formData, "description") || undefined,
      url: readString(formData, "url") || undefined,
      type,
      estimatedMinutes: minutesBetween(start, end),
      scheduledStartMinutes: start,
      scheduledEndMinutes: end,
      scheduledDate,
      sequenceOrder,
    },
  })

  revalidatePath("/today")
  revalidatePath(`/today?date=${selectedDate}`)
}

export async function updateCalendarItem(itemId: string, formData: FormData) {
  const user = await getUser()
  const item = await db.roadmapItem.findFirst({
    where: { id: itemId, roadmap: { userId: user.id } },
    include: { roadmap: true },
  })
  if (!item) throw new Error("Item not found")

  const title = readString(formData, "title")
  if (!title) throw new Error("Title is required")

  const start = parseTimeToMinutes(readString(formData, "startTime"))
  const end = parseTimeToMinutes(readString(formData, "endTime"))
  const domain = parseDomain(readString(formData, "domain"))
  const type = parseItemType(readString(formData, "type"))
  const roadmap =
    item.roadmap.domain === domain ? item.roadmap : await getOrCreateRoadmap(user.id, domain)

  await db.roadmapItem.update({
    where: { id: itemId },
    data: {
      roadmapId: roadmap.id,
      title,
      description: readString(formData, "description") || null,
      url: readString(formData, "url") || null,
      type,
      estimatedMinutes: minutesBetween(start, end),
      scheduledStartMinutes: start,
      scheduledEndMinutes: end,
      sequenceOrder: start ?? item.sequenceOrder,
    },
  })

  revalidatePath("/today")
  if (item.scheduledDate) {
    revalidatePath(
      `/today?date=${getDateStringInTimeZone(item.scheduledDate, user.timezone)}`
    )
  }
}

export async function deleteCalendarItem(itemId: string) {
  const user = await getUser()
  const item = await db.roadmapItem.findFirst({
    where: { id: itemId, roadmap: { userId: user.id } },
  })
  if (!item) throw new Error("Item not found")

  await db.$transaction([
    db.studySession.updateMany({
      where: { roadmapItemId: itemId },
      data: { roadmapItemId: null },
    }),
    db.quizCard.updateMany({
      where: { roadmapItemId: itemId },
      data: { roadmapItemId: null },
    }),
    db.roadmapItem.delete({ where: { id: itemId } }),
  ])

  revalidatePath("/today")
  if (item.scheduledDate) {
    revalidatePath(
      `/today?date=${getDateStringInTimeZone(item.scheduledDate, user.timezone)}`
    )
  }
}
