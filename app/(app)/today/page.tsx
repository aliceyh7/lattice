import { db } from "@/lib/db"
import {
  addDaysToDateString,
  formatDateLabel,
  getDateStringInTimeZone,
  getLocalDateRange,
  parseDateParam,
} from "@/lib/local-date"
import { getUser } from "@/lib/user"
import type { Domain } from "@prisma/client"
import { TodayClient } from "./today-client"

function dateHref(dateString: string, todayDateString: string) {
  if (dateString === todayDateString) return "/today"
  return `/today?date=${dateString}`
}

async function getItemsForDate(
  userId: string,
  selectedDateString: string,
  timeZone: string
) {
  const now = new Date()
  const { start, end } = getLocalDateRange(selectedDateString, timeZone)

  return db.roadmapItem.findMany({
    where: {
      roadmap: { userId, status: "ACTIVE" },
      OR: [
        {
          scheduledDate: {
            gte: start,
            lt: end,
          },
        },
        {
          sessions: {
            some: {
              status: "COMPLETED",
              startedAt: {
                gte: start,
                lt: end,
              },
            },
          },
        },
      ],
    },
    include: {
      roadmap: { select: { title: true, domain: true } },
      sessions: {
        orderBy: { startedAt: "desc" },
        take: 1,
      },
      quizCards: {
        where: { nextReviewAt: { lte: now } },
        select: { id: true },
      },
    },
    orderBy: [{ roadmap: { domain: "asc" } }, { sequenceOrder: "asc" }],
  })
}

async function getDueReviewItems(userId: string) {
  const now = new Date()
  return db.roadmapItem.count({
    where: {
      roadmap: { userId, status: "ACTIVE" },
      nextReviewAt: { lte: now },
      status: "COMPLETED",
    },
  })
}

async function getNotesForDate(
  userId: string,
  selectedDateString: string,
  timeZone: string
) {
  const { start, end } = getLocalDateRange(selectedDateString, timeZone)

  return db.note.findMany({
    where: {
      bodyMarkdown: { not: "" },
      session: {
        userId,
        startedAt: {
          gte: start,
          lt: end,
        },
      },
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
    orderBy: [{ session: { startedAt: "asc" } }, { createdAt: "asc" }],
  })
}

async function getActivityDays(
  userId: string,
  todayDateString: string,
  selectedDateString: string,
  timeZone: string
) {
  const firstDateString = addDaysToDateString(todayDateString, -34)
  const { start } = getLocalDateRange(firstDateString, timeZone)
  const { end } = getLocalDateRange(addDaysToDateString(todayDateString, 1), timeZone)

  const sessions = await db.studySession.findMany({
    where: {
      userId,
      status: "COMPLETED",
      startedAt: {
        gte: start,
        lt: end,
      },
    },
    select: { startedAt: true },
  })

  const counts = new Map<string, number>()
  for (const session of sessions) {
    const day = getDateStringInTimeZone(session.startedAt, timeZone)
    counts.set(day, (counts.get(day) ?? 0) + 1)
  }

  const days = Array.from({ length: 35 }, (_, index) => {
    const date = addDaysToDateString(firstDateString, index)
    return {
      date,
      count: counts.get(date) ?? 0,
      href: dateHref(date, todayDateString),
      isSelected: date === selectedDateString,
      isToday: date === todayDateString,
    }
  })

  let currentStreak = 0
  for (let offset = 0; offset < 35; offset++) {
    const date = addDaysToDateString(todayDateString, -offset)
    if ((counts.get(date) ?? 0) === 0) break
    currentStreak += 1
  }

  return { days, currentStreak }
}

type TodayPageProps = {
  searchParams?: Promise<{ date?: string | string[] }>
}

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const user = await getUser()
  const params = await searchParams
  const todayDateString = getDateStringInTimeZone(new Date(), user.timezone)
  const hasExplicitDate = Boolean(
    Array.isArray(params?.date) ? params?.date[0] : params?.date
  )
  const selectedDate = parseDateParam(params?.date, todayDateString)

  const [items, dueReviews, notes, activity] = await Promise.all([
    getItemsForDate(user.id, selectedDate, user.timezone),
    getDueReviewItems(user.id),
    getNotesForDate(user.id, selectedDate, user.timezone),
    getActivityDays(user.id, todayDateString, selectedDate, user.timezone),
  ])

  const grouped: Partial<Record<Domain, typeof items>> = {}
  for (const item of items) {
    const domain = item.roadmap.domain
    if (!grouped[domain]) grouped[domain] = []
    grouped[domain]!.push(item)
  }

  const totalMinutes = items
    .filter((i) => i.status !== "COMPLETED" && i.status !== "SKIPPED")
    .reduce((acc: number, i) => acc + i.estimatedMinutes, 0)

  const stats = {
    completedToday: items.filter((i) => i.status === "COMPLETED").length,
    totalToday: items.length,
  }

  return (
    <TodayClient
      grouped={grouped}
      totalMinutes={totalMinutes}
      dueReviews={dueReviews}
      stats={stats}
      notes={notes.map((note) => ({
        id: note.id,
        title: note.title || note.session?.roadmapItem?.title || "Untitled note",
        bodyMarkdown: note.bodyMarkdown,
        roadmapTitle: note.session?.roadmapItem?.roadmap.title || null,
        itemTitle: note.session?.roadmapItem?.title || null,
        domain: note.session?.roadmapItem?.roadmap.domain || null,
      }))}
      activity={activity}
      dateLabel={formatDateLabel(selectedDate)}
      previousDateHref={dateHref(
        addDaysToDateString(selectedDate, -1),
        todayDateString
      )}
      nextDateHref={dateHref(
        addDaysToDateString(selectedDate, 1),
        todayDateString
      )}
      todayHref="/today"
      isToday={selectedDate === todayDateString}
      selectedDate={selectedDate}
      hasExplicitDate={hasExplicitDate}
    />
  )
}
