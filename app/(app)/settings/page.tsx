import { revalidatePath } from "next/cache"
import { CheckCircle2, Clock3, Database, Settings2, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/lib/db"
import { getUser } from "@/lib/user"

const timezones = [
  "America/Los_Angeles",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "UTC",
]

async function updateSettings(formData: FormData) {
  "use server"

  const user = await getUser()
  const name = String(formData.get("name") ?? "").trim()
  const timezone = String(formData.get("timezone") ?? user.timezone)
  const weeklyCapacityHours = Number(formData.get("weeklyCapacityHours"))

  await db.user.update({
    where: { id: user.id },
    data: {
      name: name || null,
      timezone: timezones.includes(timezone) ? timezone : user.timezone,
      weeklyCapacityHours:
        Number.isFinite(weeklyCapacityHours) && weeklyCapacityHours > 0
          ? Math.min(Math.round(weeklyCapacityHours), 80)
          : user.weeklyCapacityHours,
    },
  })

  revalidatePath("/settings")
  revalidatePath("/today")
}

export default async function SettingsPage() {
  const user = await getUser()

  const [activeRoadmaps, scheduledItems, completedItems, sessions] =
    await Promise.all([
      db.roadmap.count({ where: { userId: user.id, status: "ACTIVE" } }),
      db.roadmapItem.count({
        where: { roadmap: { userId: user.id }, scheduledDate: { not: null } },
      }),
      db.roadmapItem.count({
        where: { roadmap: { userId: user.id }, status: "COMPLETED" },
      }),
      db.studySession.count({ where: { userId: user.id } }),
    ])

  const cards = [
    { label: "Active roadmaps", value: activeRoadmaps, icon: Settings2 },
    { label: "Scheduled items", value: scheduledItems, icon: Clock3 },
    { label: "Completed items", value: completedItems, icon: CheckCircle2 },
    { label: "Study sessions", value: sessions, icon: Database },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tune the defaults Lattice uses to plan your daily work.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xl font-semibold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              Profile
            </CardTitle>
            <CardDescription>
              These settings are used by the daily schedule and planning views.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateSettings} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Name</span>
                <input
                  name="name"
                  defaultValue={user.name ?? ""}
                  placeholder="Alice"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Timezone</span>
                <select
                  name="timezone"
                  defaultValue={user.timezone}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  {timezones.map((timezone) => (
                    <option key={timezone} value={timezone}>
                      {timezone}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Weekly capacity</span>
                <div className="flex items-center gap-2">
                  <input
                    name="weeklyCapacityHours"
                    type="number"
                    min={1}
                    max={80}
                    defaultValue={user.weeklyCapacityHours}
                    className="h-9 w-24 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
                  />
                  <span className="text-sm text-muted-foreground">hours per week</span>
                </div>
              </label>

              <Button type="submit">Save settings</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>
              Current operating assumptions for this curriculum.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Primary focus
              </p>
              <p className="mt-1 text-sm">
                RecSys depth, Python interview speed, paper synthesis, and
                publishable notes.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Daily entry point
              </p>
              <p className="mt-1 text-sm">Use Today for scheduled execution.</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Review loop
              </p>
              <p className="mt-1 text-sm">
                Completed items can surface again when their review date is due.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
