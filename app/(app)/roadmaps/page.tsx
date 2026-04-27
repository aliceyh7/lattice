import { db } from "@/lib/db"
import { getUser } from "@/lib/user"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DOMAIN_META } from "@/lib/domain"
import type { Domain } from "@prisma/client"

export default async function RoadmapsPage() {
  const user = await getUser()

  const roadmaps = await db.roadmap.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
      items: {
        where: { status: "COMPLETED" },
        select: { id: true },
      },
    },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  })

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Roadmaps</h1>
      <div className="grid gap-3">
        {roadmaps.map((rm) => {
          const meta = DOMAIN_META[rm.domain as Domain]
          const pct =
            rm._count.items > 0
              ? Math.round((rm.items.length / rm._count.items) * 100)
              : 0
          return (
            <Card key={rm.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${meta.bg} ${meta.color} border-0 text-xs`}>
                      {meta.label}
                    </Badge>
                    {rm.targetRole && (
                      <span className="text-xs text-muted-foreground">{rm.targetRole}</span>
                    )}
                  </div>
                  <p className="font-medium text-sm truncate">{rm.title}</p>
                  {rm.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {rm.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{pct}%</p>
                  <p className="text-xs text-muted-foreground">
                    {rm.items.length}/{rm._count.items}
                  </p>
                  <Progress value={pct} className="mt-2 h-1.5 w-20" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
