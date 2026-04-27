import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import type { Domain } from "@prisma/client"
import { format, startOfDay, endOfDay } from "date-fns"
import { TodayClient } from "./today-client"

async function getUser(clerkId: string) {
  return db.user.findUnique({ where: { clerkId } })
}

async function getTodayItems(userId: string) {
  const now = new Date()
  const items = await db.roadmapItem.findMany({
    where: {
      roadmap: { userId },
      scheduledDate: {
        gte: startOfDay(now),
        lte: endOfDay(now),
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
  return items
}

async function getDueReviewItems(userId: string) {
  const now = new Date()
  return db.roadmapItem.count({
    where: {
      roadmap: { userId },
      nextReviewAt: { lte: now },
      status: "COMPLETED",
    },
  })
}

async function getStreakAndStats(userId: string) {
  const today = startOfDay(new Date())
  const completedToday = await db.studySession.count({
    where: {
      userId,
      status: "COMPLETED",
      startedAt: { gte: today },
    },
  })
  const totalToday = await db.roadmapItem.count({
    where: {
      roadmap: { userId },
      scheduledDate: {
        gte: startOfDay(new Date()),
        lte: endOfDay(new Date()),
      },
    },
  })
  return { completedToday, totalToday }
}

export default async function TodayPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  const user = await getUser(clerkId)
  if (!user) redirect("/onboard")

  const [items, dueReviews, stats] = await Promise.all([
    getTodayItems(user.id),
    getDueReviewItems(user.id),
    getStreakAndStats(user.id),
  ])

  // Group by domain
  const grouped: Partial<Record<Domain, typeof items>> = {}
  for (const item of items) {
    const domain = item.roadmap.domain
    if (!grouped[domain]) grouped[domain] = []
    grouped[domain]!.push(item)
  }

  const totalMinutes = items
    .filter((i) => i.status !== "COMPLETED" && i.status !== "SKIPPED")
    .reduce((acc: number, i) => acc + i.estimatedMinutes, 0)

  return (
    <TodayClient
      grouped={grouped}
      totalMinutes={totalMinutes}
      dueReviews={dueReviews}
      stats={stats}
      dateLabel={format(new Date(), "EEEE, MMMM d")}
    />
  )
}
