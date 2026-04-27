"use client"

import { Domain } from "@prisma/client"
import { DOMAIN_META, DIFFICULTY_META } from "@/lib/domain"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ResourceBadge } from "@/components/resource-preview"
import {
  Clock,
  Play,
  SkipForward,
  CalendarClock,
  RotateCcw,
  CheckCircle2,
  Circle,
  ExternalLink,
  Brain,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useTransition } from "react"
import { updateItemStatus, startSession } from "./actions"

type ItemWithRelations = {
  id: string
  title: string
  type: string
  url: string | null
  estimatedMinutes: number
  difficulty: string | null
  status: string
  struggled: boolean
  roadmap: { title: string; domain: Domain }
  sessions: { id: string }[]
  quizCards: { id: string }[]
}

type Props = {
  grouped: Partial<Record<Domain, ItemWithRelations[]>>
  totalMinutes: number
  dueReviews: number
  stats: { completedToday: number; totalToday: number }
  dateLabel: string
}

const DOMAIN_ORDER: Domain[] = [
  "ML_RECSYS",
  "LEETCODE",
  "MATH_STATS",
  "CPP_SYSTEMS",
  "DISTRIBUTED_TRAINING",
  "REVIEW",
  "OTHER",
]

function TaskCard({ item }: { item: ItemWithRelations }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const diffMeta = item.difficulty
    ? DIFFICULTY_META[item.difficulty as keyof typeof DIFFICULTY_META]
    : null
  const isDone = item.status === "COMPLETED"
  const isSkipped = item.status === "SKIPPED"

  function handleAction(action: "COMPLETED" | "SKIPPED" | "DEFERRED") {
    startTransition(async () => {
      await updateItemStatus(item.id, action)
      router.refresh()
      if (action === "COMPLETED") toast.success("Marked complete ✓")
      if (action === "SKIPPED") toast("Skipped — no guilt.")
      if (action === "DEFERRED") toast("Moved to tomorrow.")
    })
  }

  async function handleStart() {
    startTransition(async () => {
      const sessionId = await startSession(item.id)
      router.push(`/sessions/${sessionId}`)
    })
  }

  return (
    <Card
      className={`transition-opacity ${isDone || isSkipped ? "opacity-50" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="mt-0.5 shrink-0">
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span
                  className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}
                >
                  {item.title}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <ResourceBadge url={item.url} type={item.type} />
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.estimatedMinutes}m
                </span>
                {diffMeta && (
                  <span className={diffMeta.color}>{diffMeta.label}</span>
                )}
                {item.quizCards.length > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <Brain className="h-3 w-3" />
                    {item.quizCards.length} due
                  </span>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-foreground/70 transition-colors hover:text-foreground"
                  >
                    Resource
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
          {!isDone && !isSkipped && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                title="Skip"
                disabled={isPending}
                onClick={() => handleAction("SKIPPED")}
              >
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                title="Move to tomorrow"
                disabled={isPending}
                onClick={() => handleAction("DEFERRED")}
              >
                <CalendarClock className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                className="h-7 gap-1 text-xs"
                disabled={isPending}
                onClick={handleStart}
              >
                <Play className="h-3 w-3" />
                Start
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function TodayClient({
  grouped,
  totalMinutes,
  dueReviews,
  stats,
  dateLabel,
}: Props) {
  const progress =
    stats.totalToday > 0
      ? Math.round((stats.completedToday / stats.totalToday) * 100)
      : 0

  const orderedDomains = DOMAIN_ORDER.filter((d) => grouped[d]?.length)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">{dateLabel}</p>
        <h1 className="text-2xl font-semibold mt-0.5">Today</h1>
      </div>

      {/* Stats bar */}
      <div className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-[auto_auto_1fr_auto] sm:items-center sm:gap-6">
        <div>
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="text-lg font-semibold">
            {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m
          </p>
        </div>
        <Separator orientation="vertical" className="hidden h-10 sm:block" />
        <div>
          <p className="text-xs text-muted-foreground">Progress</p>
          <p className="text-lg font-semibold">
            {stats.completedToday}/{stats.totalToday}
          </p>
        </div>
        <div className="sm:col-start-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Day completion</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {dueReviews > 0 && (
          <>
            <Separator orientation="vertical" className="hidden h-10 sm:block" />
            <div>
              <p className="text-xs text-muted-foreground">Reviews due</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <RotateCcw className="h-4 w-4 text-amber-500" />
                {dueReviews}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Task groups */}
      {orderedDomains.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No tasks scheduled for today.</p>
          <p className="text-sm mt-1">Check your roadmaps or import a schedule.</p>
        </div>
      ) : (
        orderedDomains.map((domain) => {
          const meta = DOMAIN_META[domain]
          const items = grouped[domain]!
          return (
            <div key={domain} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={`${meta.bg} ${meta.color} border-0 font-medium`}
                >
                  {meta.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {items.filter((i) => i.status === "COMPLETED").length}/
                  {items.length} done ·{" "}
                  {items
                    .filter(
                      (i) =>
                        i.status !== "COMPLETED" && i.status !== "SKIPPED"
                    )
                    .reduce((a, i) => a + i.estimatedMinutes, 0)}
                  m left
                </span>
              </div>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <TaskCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
