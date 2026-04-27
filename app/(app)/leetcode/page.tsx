import { db } from "@/lib/db"
import { getUser } from "@/lib/user"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DIFFICULTY_META } from "@/lib/domain"
import { format } from "date-fns"
import { CheckCircle2, Circle, ExternalLink, Code2 } from "lucide-react"
import type { Difficulty } from "@prisma/client"

function getTopicFromTitle(title: string): string {
  if (title.includes("Review")) return "Review"
  if (title.includes("Cache") || title.includes("Design") || title.includes("Autocomplete") || title.includes("Data Stream") || title.includes("GetRandom") || title.includes("File System")) return "Design"
  if (title.includes("Tree") || title.includes("BST") || title.includes("Serialize") || title.includes("Path Sum") || title.includes("Merge k") || title.includes("Kth Smallest")) return "Trees & Linked Lists"
  if (title.includes("Ladder") || title.includes("Island") || title.includes("Itinerary") || title.includes("Course") || title.includes("Flights") || title.includes("Bus") || title.includes("Swim") || title.includes("Path in") || title.includes("Division") || title.includes("Accounts")) return "Graphs"
  if (title.includes("Window") || title.includes("Substring") || title.includes("Subsequence") || title.includes("Subarray") || title.includes("Rain Water") || title.includes("Shortest Subarray")) return "Windows & Prefix"
  if (title.includes("Median") || title.includes("Kth") || title.includes("Scheduler") || title.includes("Sticks") || title.includes("Refueling")) return "Heap / Binary Search"
  if (title.includes("Rectangle") || title.includes("Calculator") || title.includes("Parentheses") || title.includes("Greater Element")) return "Stack"
  if (title.includes("Distance") || title.includes("Ways") || title.includes("Profit") || title.includes("Square") || title.includes("Increasing") || title.includes("Decode") || title.includes("Jump") || title.includes("Coin") || title.includes("Product") || title.includes("Regex") || title.includes("Regular Expression") || title.includes("Job Scheduling") || title.includes("Stock")) return "Dynamic Programming"
  if (title.includes("Word Search") || title.includes("N-Queens") || title.includes("Expression") || title.includes("Word Break")) return "Backtracking"
  return "Other"
}

export default async function LeetCodePage() {
  const user = await getUser()

  const items = await db.roadmapItem.findMany({
    where: { roadmap: { userId: user.id, domain: "LEETCODE", status: "ACTIVE" } },
    orderBy: [{ scheduledDate: "asc" }, { sequenceOrder: "asc" }],
  })

  const total = items.length
  const done = items.filter((i) => i.status === "COMPLETED").length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  // Group by topic
  const grouped = new Map<string, typeof items>()
  for (const item of items) {
    const topic = getTopicFromTitle(item.title)
    if (!grouped.has(topic)) grouped.set(topic, [])
    grouped.get(topic)!.push(item)
  }

  const diffCounts = {
    EASY: items.filter((i) => i.difficulty === "EASY"),
    MEDIUM: items.filter((i) => i.difficulty === "MEDIUM"),
    HARD: items.filter((i) => i.difficulty === "HARD"),
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">LeetCode</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Advanced Python mix · shuffled medium-hard set · {done}/{total} solved
        </p>
      </div>

      {/* Summary card */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall progress</span>
            <span className="text-sm text-muted-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
          <div className="flex gap-4 text-xs text-muted-foreground">
            {(["EASY", "MEDIUM", "HARD"] as const).map((d) => {
              const count = diffCounts[d]
              const solvedCount = count.filter((i) => i.status === "COMPLETED").length
              return (
                <span key={d} className={DIFFICULTY_META[d].color}>
                  {DIFFICULTY_META[d].label}: {solvedCount}/{count.length}
                </span>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Problems by topic */}
      {Array.from(grouped.entries()).map(([topic, probs]) => {
        const topicDone = probs.filter((i) => i.status === "COMPLETED").length
        return (
          <div key={topic} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{topic}</h2>
              <span className="text-xs text-muted-foreground">{topicDone}/{probs.length}</span>
            </div>
            <div className="space-y-1.5">
              {probs.map((item) => {
                const diff = item.difficulty as Difficulty | null
                const isDone = item.status === "COMPLETED"
                const isInProgress = item.status === "IN_PROGRESS"
                return (
                  <Card
                    key={item.id}
                    className={isDone ? "opacity-55" : isInProgress ? "border-amber-300" : ""}
                  >
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
                            Scheduled {format(item.scheduledDate, "EEE MMM d")} · {item.estimatedMinutes} min
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {diff && (
                          <span className={`text-xs font-medium ${DIFFICULTY_META[diff].color}`}>
                            {DIFFICULTY_META[diff].label}
                          </span>
                        )}
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Open on LeetCode"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <div className="w-3.5" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {total === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Code2 className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p>No problems found. Make sure the database is seeded.</p>
        </div>
      )}
    </div>
  )
}
