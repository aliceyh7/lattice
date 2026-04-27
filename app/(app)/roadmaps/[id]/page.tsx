import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react"
import { db } from "@/lib/db"
import { getUser } from "@/lib/user"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DOMAIN_META, DIFFICULTY_META } from "@/lib/domain"
import { buildRoadmapUnits, getRoadmapNarrative } from "@/lib/roadmap-content"
import type { Difficulty, Domain } from "@prisma/client"

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()

  const roadmap = await db.roadmap.findFirst({
    where: { id, userId: user.id, status: "ACTIVE" },
    include: {
      items: {
        orderBy: [{ scheduledDate: "asc" }, { sequenceOrder: "asc" }],
      },
    },
  })

  if (!roadmap) notFound()

  const meta = DOMAIN_META[roadmap.domain as Domain]
  const narrative = getRoadmapNarrative(roadmap)
  const units = buildRoadmapUnits(roadmap, roadmap.items)
  const completed = roadmap.items.filter((item) => item.status === "COMPLETED").length
  const total = roadmap.items.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const minutes = roadmap.items.reduce((acc, item) => acc + item.estimatedMinutes, 0)

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <Link
        href="/roadmaps"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Roadmaps
      </Link>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${meta.bg} ${meta.color} border-0`}>
            {meta.label}
          </Badge>
          {roadmap.targetRole && (
            <Badge variant="secondary">{roadmap.targetRole}</Badge>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{roadmap.title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {narrative.summary}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="mt-1 text-xl font-semibold">{pct}%</p>
              <Progress value={pct} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="mt-1 text-xl font-semibold">
                {completed}/{total}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Planned time</p>
              <p className="mt-1 text-xl font-semibold">
                {Math.round(minutes / 60)}h {minutes % 60}m
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-base font-semibold">What this gets you</h2>
          <div className="mt-3 grid gap-2">
            {narrative.outcomes.map((outcome) => (
              <div key={outcome} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{outcome}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-base font-semibold">Units</h2>
        {units.map((unit) => {
          const unitCompleted = unit.items.filter((item) => item.status === "COMPLETED").length
          const unitPct =
            unit.items.length > 0
              ? Math.round((unitCompleted / unit.items.length) * 100)
              : 0

          return (
            <Card key={unit.title}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold">{unit.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {unit.description}
                    </p>
                  </div>
                  <div className="w-24 shrink-0 text-right">
                    <p className="text-xs font-medium">{unitCompleted}/{unit.items.length}</p>
                    <Progress value={unitPct} className="mt-1 h-1.5" />
                  </div>
                </div>

                <div className="divide-y rounded-lg border">
                  {unit.items.map((item) => {
                    const diff = item.difficulty as Difficulty | null
                    const isDone = item.status === "COMPLETED"
                    return (
                      <div key={item.id} className="flex items-start gap-3 p-3">
                        {isDone ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{item.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {item.scheduledDate && (
                              <span>{format(item.scheduledDate, "MMM d")}</span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.estimatedMinutes}m
                            </span>
                            {diff && (
                              <span className={DIFFICULTY_META[diff].color}>
                                {DIFFICULTY_META[diff].label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
