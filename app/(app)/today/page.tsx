import { db } from "@/lib/db"
import { getUser } from "@/lib/user"
import type { Domain } from "@prisma/client"
import {
  addDays,
  endOfDay,
  format,
  isSameDay,
  isValid,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns"
import { TodayClient } from "./today-client"

function parseSelectedDate(dateParam: string | string[] | undefined) {
  const value = Array.isArray(dateParam) ? dateParam[0] : dateParam
  if (!value) return new Date()

  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : new Date()
}

function dateHref(date: Date) {
  const today = new Date()
  if (isSameDay(date, today)) return "/today"
  return `/today?date=${format(date, "yyyy-MM-dd")}`
}

async function getItemsForDate(userId: string, selectedDate: Date) {
  const now = new Date()
  return db.roadmapItem.findMany({
    where: {
      roadmap: { userId, status: "ACTIVE" },
      scheduledDate: {
        gte: startOfDay(selectedDate),
        lte: endOfDay(selectedDate),
      },
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

type TodayPageProps = {
  searchParams?: Promise<{ date?: string | string[] }>
}

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const user = await getUser()
  const params = await searchParams
  const selectedDate = parseSelectedDate(params?.date)

  const [items, dueReviews] = await Promise.all([
    getItemsForDate(user.id, selectedDate),
    getDueReviewItems(user.id),
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
      dateLabel={format(selectedDate, "EEEE, MMMM d")}
      previousDateHref={dateHref(subDays(selectedDate, 1))}
      nextDateHref={dateHref(addDays(selectedDate, 1))}
      todayHref="/today"
      isToday={isSameDay(selectedDate, new Date())}
    />
  )
}
