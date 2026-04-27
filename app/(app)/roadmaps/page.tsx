import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DOMAIN_META } from "@/lib/domain"
import type { Domain } from "@prisma/client"

export default async function RoadmapsPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")
  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/onboard")

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
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
