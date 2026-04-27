import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DOMAIN_META } from "@/lib/domain"
import type { Domain } from "@prisma/client"
import { Brain, RotateCcw } from "lucide-react"

export default async function ReviewsPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")
  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) redirect("/onboard")

  const now = new Date()

  const [dueItems, dueCards] = await Promise.all([
    db.roadmapItem.findMany({
      where: {
        roadmap: { userId: user.id },
        nextReviewAt: { lte: now },
        status: "COMPLETED",
      },
      include: { roadmap: { select: { domain: true, title: true } } },
      orderBy: { nextReviewAt: "asc" },
      take: 20,
    }),
    db.quizCard.count({
      where: {
        note: { session: { userId: user.id } },
        nextReviewAt: { lte: now },
      },
    }),
  ])

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {dueItems.length} items due · {dueCards} quiz cards due
        </p>
      </div>

      {dueCards > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Brain className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium">{dueCards} quiz cards ready</p>
              <p className="text-xs text-muted-foreground">Quiz card review coming in MVP 2.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {dueItems.map((item) => {
          const meta = DOMAIN_META[item.roadmap.domain as Domain]
          return (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <RotateCcw className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.roadmap.title}</p>
                </div>
                <Badge className={`${meta.bg} ${meta.color} border-0 text-xs shrink-0`}>
                  {meta.label}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
        {dueItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <RotateCcw className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p>No reviews due. Come back after completing some sessions.</p>
          </div>
        )}
      </div>
    </div>
  )
}
