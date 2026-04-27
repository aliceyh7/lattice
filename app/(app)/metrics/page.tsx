import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { startOfWeek, endOfWeek, subDays, format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, RotateCcw, TrendingUp } from "lucide-react"

export default async function MetricsPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")
  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/onboard")

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })

  const [
    totalCompleted,
    completedThisWeek,
    totalMinutesResult,
    struggledCount,
    papersRead,
    reviewsDue,
  ] = await Promise.all([
    db.roadmapItem.count({ where: { roadmap: { userId: user.id }, status: "COMPLETED" } }),
    db.studySession.count({
      where: { userId: user.id, status: "COMPLETED", startedAt: { gte: weekStart } },
    }),
    db.studySession.aggregate({
      where: { userId: user.id, status: "COMPLETED", actualMinutes: { not: null } },
      _sum: { actualMinutes: true },
    }),
    db.roadmapItem.count({
      where: { roadmap: { userId: user.id }, struggled: true },
    }),
    db.roadmapItem.count({
      where: { roadmap: { userId: user.id }, type: "PAPER", status: "COMPLETED" },
    }),
    db.roadmapItem.count({
      where: { roadmap: { userId: user.id }, nextReviewAt: { lte: now }, status: "COMPLETED" },
    }),
  ])

  const totalHours = Math.round((totalMinutesResult._sum.actualMinutes ?? 0) / 60)

  const stats = [
    { label: "Sessions this week", value: completedThisWeek, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Total hours studied", value: `${totalHours}h`, icon: Clock, color: "text-blue-500" },
    { label: "Papers read", value: papersRead, icon: TrendingUp, color: "text-violet-500" },
    { label: "Reviews due", value: reviewsDue, icon: RotateCcw, color: "text-amber-500" },
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Metrics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Week of {format(weekStart, "MMM d")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`h-5 w-5 shrink-0 ${color}`} />
              <div>
                <p className="text-2xl font-semibold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Netflix RecSys Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Two-Tower retrieval", pct: Math.min(100, papersRead >= 6 ? 60 : papersRead * 10) },
            { label: "Multi-task ranking (MMoE/PLE)", pct: Math.min(100, papersRead >= 9 ? 50 : papersRead * 5) },
            { label: "LeetCode — Trees/Graphs", pct: Math.min(100, totalCompleted * 2) },
            { label: "Industrial architecture breadth", pct: Math.min(100, papersRead * 5) },
          ].map(({ label, pct }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span className="text-muted-foreground">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-1">
            Readiness scores update as you complete papers and sessions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
