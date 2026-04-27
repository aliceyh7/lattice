import { db } from "@/lib/db"
import { getUser } from "@/lib/user"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ResourceBadge } from "@/components/resource-preview"
import { DOMAIN_META } from "@/lib/domain"
import { cn } from "@/lib/utils"
import { format, startOfWeek } from "date-fns"
import { CheckCircle2, Circle, ExternalLink, BookOpen } from "lucide-react"
import type { Domain } from "@prisma/client"

export default async function PapersPage() {
  const user = await getUser()

  const papers = await db.roadmapItem.findMany({
    where: {
      roadmap: { userId: user.id },
      type: "PAPER",
    },
    include: { roadmap: { select: { domain: true } } },
    orderBy: [{ scheduledDate: "asc" }, { sequenceOrder: "asc" }],
  })

  // Also grab reading-type items from ML_RECSYS — papers may be filed as READING
  const readings = await db.roadmapItem.findMany({
    where: {
      roadmap: { userId: user.id, domain: "ML_RECSYS" },
      type: "READING",
    },
    include: { roadmap: { select: { domain: true } } },
    orderBy: [{ scheduledDate: "asc" }],
  })

  const all = [...papers, ...readings].sort(
    (a, b) => (a.scheduledDate?.getTime() ?? 0) - (b.scheduledDate?.getTime() ?? 0)
  )

  const done = all.filter((i) => i.status === "COMPLETED").length

  const grouped = new Map<string, typeof all>()
  for (const item of all) {
    const d = item.scheduledDate ?? new Date()
    const weekLabel = `Week of ${format(startOfWeek(d, { weekStartsOn: 1 }), "MMM d")}`
    if (!grouped.has(weekLabel)) grouped.set(weekLabel, [])
    grouped.get(weekLabel)!.push(item)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Papers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {done}/{all.length} read · RecSys &amp; ML papers
        </p>
      </div>

      {all.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p>Papers start in Week 3 — come back then.</p>
        </div>
      )}

      {Array.from(grouped.entries()).map(([week, items]) => (
        <div key={week} className="space-y-1.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {week}
          </h2>
          <div className="space-y-1.5">
            {items.map((item) => {
              const meta = DOMAIN_META[item.roadmap.domain as Domain]
              const isDone = item.status === "COMPLETED"
              return (
                <Card key={item.id} className={isDone ? "opacity-60" : ""}>
                  <CardContent className="p-3 flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.scheduledDate && (
                        <p className="text-xs text-muted-foreground">
                          {format(item.scheduledDate, "EEE MMM d")} · {item.estimatedMinutes} min
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`${meta.bg} ${meta.color} border-0 text-xs`}>
                        {meta.label}
                      </Badge>
                      <ResourceBadge url={item.url} type={item.type} />
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 px-2")}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
